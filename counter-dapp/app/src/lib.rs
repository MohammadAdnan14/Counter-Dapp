#![no_std]

use core::cell::RefCell;
use sails_rs::prelude::*;

#[sails_rs::sails_type]
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum CounterError {
    Unauthorized,
}

#[derive(Clone, Debug)]
pub struct CounterState {
    pub owner: ActorId,
    pub value: i32,
}

impl Default for CounterState {
    fn default() -> Self {
        Self {
            owner: ActorId::zero(),
            value: 0,
        }
    }
}

pub struct Counter<S: StateMut<Item = CounterState, Error = Infallible> = RefCell<CounterState>> {
    state: S,
}

impl<S: StateMut<Item = CounterState, Error = Infallible>> Counter<S> {
    pub fn new(state: S) -> Self {
        Self { state }
    }
}

#[sails_rs::service]
impl<S: StateMut<Item = CounterState, Error = Infallible>> Counter<S> {
    #[export]
    pub fn increment(&mut self) -> i32 {
        let mut state = self.state.get_mut();
        state.value += 1;
        state.value
    }

    #[export]
    pub fn decrement(&mut self) -> i32 {
        let mut state = self.state.get_mut();
        state.value -= 1;
        state.value
    }

    #[export]
    pub fn reset(&mut self) -> Result<(), CounterError> {
        let caller = Syscall::message_source();
        {
            let mut state = self.state.get_mut();
            if caller != state.owner {
                return Err(CounterError::Unauthorized);
            }
            state.value = 0;
        }

        Ok(())
    }

    #[export]
    pub fn value(&self) -> i32 {
        self.state.get().value
    }
}

#[derive(Default)]
pub struct Program {
    counter_state: RefCell<CounterState>,
}

#[sails_rs::program]
impl Program {
    pub fn create() -> Self {
        Self {
            counter_state: RefCell::new(CounterState {
                owner: Syscall::message_source(),
                value: 0,
            }),
        }
    }

    pub fn counter(&self) -> Counter<&RefCell<CounterState>> {
        Counter::new(&self.counter_state)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use sails_rs::gstd::services::Service as _;

    #[test]
    fn starts_at_zero() {
        let state = RefCell::new(CounterState {
            owner: ActorId::from(42),
            value: 0,
        });
        let service = Counter::new(&state).expose(0);

        assert_eq!(0, service.value());
    }

    #[test]
    fn increments_and_decrements() {
        let actor = ActorId::from(42);
        Syscall::with_message_source(actor);
        let state = RefCell::new(CounterState {
            owner: actor,
            value: 0,
        });
        let mut service = Counter::new(&state).expose(0);

        assert_eq!(1, service.increment());
        assert_eq!(2, service.increment());
        assert_eq!(1, service.decrement());
        assert_eq!(1, service.value());
    }

    #[test]
    fn only_owner_can_reset() {
        let owner = ActorId::from(42);
        let stranger = ActorId::from(7);
        let state = RefCell::new(CounterState { owner, value: 10 });
        let mut service = Counter::new(&state).expose(0);

        Syscall::with_message_source(stranger);
        assert_eq!(Err(CounterError::Unauthorized), service.reset());
        assert_eq!(10, service.value());

        Syscall::with_message_source(owner);
        assert_eq!(Ok(()), service.reset());
        assert_eq!(0, service.value());
    }
}
