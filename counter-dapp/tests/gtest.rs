use ::counter_dapp_client::{CounterDappClient as _, CounterDappClientCtors as _, counter::*};
#[allow(unused_imports)]
use sails_rs::{client::*, gtest::*, prelude::*};

#[tokio::test]
async fn counter_flow_works() {
    let env = GtestEnv::system_default();
    let code_id = env.system().submit_code(::counter_dapp::WASM_BINARY);

    let program = env
        .deploy::<::counter_dapp_client::CounterDappClientProgram>(code_id, b"salt".to_vec())
        .create()
        .await
        .unwrap();

    let mut counter = program.counter();

    assert_eq!(0, counter.value().await.unwrap());
    assert_eq!(1, counter.increment().await.unwrap());
    assert_eq!(2, counter.increment().await.unwrap());
    assert_eq!(1, counter.decrement().await.unwrap());
    assert_eq!(1, counter.value().await.unwrap());
}

#[tokio::test]
async fn reset_is_owner_gated() {
    let env = GtestEnv::system_default();
    let code_id = env.system().submit_code(::counter_dapp::WASM_BINARY);

    let program = env
        .deploy::<::counter_dapp_client::CounterDappClientProgram>(code_id, b"salt".to_vec())
        .create()
        .await
        .unwrap();

    let mut counter = program.counter();
    assert_eq!(1, counter.increment().await.unwrap());

    let bob_env = env.with_actor_id(DEFAULT_USER_BOB.into());
    let unauthorized = ::counter_dapp_client::CounterDappClientProgram::client(program.id())
        .with_env(&bob_env)
        .counter()
        .reset()
        .await
        .unwrap();
    assert_eq!(Err(CounterError::Unauthorized), unauthorized);
    assert_eq!(1, counter.value().await.unwrap());

    assert_eq!(Ok(()), counter.reset().await.unwrap());
    assert_eq!(0, counter.value().await.unwrap());
}
