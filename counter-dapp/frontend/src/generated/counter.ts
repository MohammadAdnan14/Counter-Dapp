export const COUNTER_IDL = `
!@sails: 1.0.0

service Counter@0xf28adeea5c08f63a {
    functions {
        Decrement() -> i32;
        Increment() -> i32;
        Reset() -> Result<(), CounterError>;
        @query
        Value() -> i32;
    }
    types {
        enum CounterError {
            Unauthorized,
        }
    }
}

program CounterDappClient {
    constructors {
        Create();
    }
    services {
        Counter@0xf28adeea5c08f63a,
    }
}
`;
