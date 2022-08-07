
# Error Result 
The `navbar` on the left is grouped by return type and ordered by how commonly you need that return type, to make it faster to find what you need.

These two methods will make the examples shorter with no need for type annotations:
```rust
fn err<T>(x: T) -> Result<T, T> {
	Err(x)	
}

fn ok<T>(x: T) -> Result<T, T> {
	Ok(x)	
}
```

This method will print the type of any argument passed in:
```rust
fn print_type<T>(message: &str, _: &T) {
    println!("{message:<20}: {}", std::any::type_name::<T>())
}
```

These docs are created with a `VS Code` extension named [codebook](https://marketplace.visualstudio.com/items?itemName=codebook.codebook), it runs the code and saves it to markdown, if the last line is an expression with no semicolon at the end, the next code cell will contain the output from the `Debug` implementation for that value.

## Value
### unwrap_or
`Ok` value 
```rust
ok(1).unwrap_or(2)
```
```output
1
```

`Err` argument value
```rust
err(1).unwrap_or(2)
```
```output
2
```

### unwrap_or_else
`Ok` value
```rust
ok(1).unwrap_or_else(|x| x * 10)
```
```output
1
```

`Err` closure result
```rust
err(1).unwrap_or_else(|x| x * 10)
```
```output
10
```

### unwrap_or_default
`Ok` value 
```rust
ok(5).unwrap_or_default()
```
```output
5
```

`Err` default value of `Ok` type
```rust
err(5).unwrap_or_default()
```
```output
0
```
```rust
let x: Result<String, u32> = Err(5);
x.unwrap_or_default()
```
```output
""
```

### map_or
`Ok` closure result
```rust
ok(1).map_or(2, |x| x * 10)
```
```output
10
```

 `Err` first argument
```rust
err(1).map_or(2, |x| x * 10)
```
```output
2
```

### map_or_else
`Ok` second closure
```rust
ok(1).map_or_else(|x| x * 10, |y| y * 100)
```
```output
100
```

`Err` first closure
```rust
err(1).map_or_else(|x| x * 10, |y| y * 100)
```
```output
10
```

## Value or Panic

### expect
`Ok` value
```rust
ok(1).expect("this will never panic")
```
```output
1
```

`Err` panic with additional context
```rust
#[ignore]
err(1).expect("more context about the panic")
```
```plaintext
thread 'main' panicked at 'more context about the panic: 1', src/main.rs:98:14
```

### expect_err
`Ok` panic with additional context 
```rust
#[ignore]
ok(1).expect_err("context on why this should error")
```
```plaintext
thread 'main' panicked at 'context on why this should error: 1', src/main.rs:105:13
```

`Err` value 
```rust
err(1).expect_err("this will never panic")
```
```output
1
```

### unwrap
`Ok` value
```rust
ok(1).unwrap()
```
```output
1
```

 `Err` panic
```rust
#[ignore]
err(1).unwrap()
```
```plaintext
thread 'main' panicked at 'called `Result::unwrap()` on an `Err` value: 1', src/main.rs:309:14
```

### unwrap_err

`Ok` panic
```rust
#[ignore]
ok(1).unwrap_err()
```
```plaintext
thread 'main' panicked at 'called `Result::unwrap_err()` on an `Ok` value: 1', src/main.rs:314:13
```

 `Err` value 
```rust
err(1).unwrap_err()
```
```output
1
```

## Bool
### is_ok
`Ok` true
```rust
ok(1).is_ok()
```
```output
true
```

 `Err` false
```rust
err(1).is_ok()
```
```output
false
```

### is_err
`Ok` false
```rust
ok(1).is_err()
```
```output
false
```

`Err` true 
```rust
err(1).is_err()
```
```output
true
```

## `Option<value>`
### ok
 `Ok` Some(value)
```rust
ok(1).ok()
```
```output
Some(1)
```

`Err` None
```rust
err(1).ok()
```
```output
None
```

### err
`Ok` None
```rust
ok(1).err()
```
```output
None
```

`Err` Some(x)
```rust
err(1).err()
```
```output
Some(1)
```

## `Result<value>`
### map
`Ok` Ok(closure result) 
```rust
ok(1).map(|x| x * 10)
```
```output
Ok(10)
```

`Err` Err(value)
```rust
err(1).map(|x| x * 10)
```
```output
Err(1)
```

### map_err
`Ok` Ok(value)
```rust
ok(1).map_err(|x| x * 10)
```
```output
Ok(1)
```

`Err` Err(closure result) 
```rust
err(1).map_err(|x| x * 10)
```
```output
Err(10)
```

### or
`Ok` Ok(value)
```rust
ok(1).or(err(1))
```
```output
Ok(1)
```

`Err` Result(value) 
```rust
err(1).or(ok(5))
```
```output
Ok(5)
```

### or_else
`Ok` Ok(value)
```rust
ok(1).or_else(|x| ok(x * 10))
```
```output
Ok(1)
```

`Err` Result(closure result) 
```rust
err(1).or_else(|x| ok(x * 10))
```
```output
Ok(10)
```

### and
This works just like a normal `&&` statement

If both sides are `Err` return the first `Err value`:
```rust
err(1).and(err(2))
```
```output
Err(1)
```

If both sides are `Ok`, return the second `Ok value`
```rust
ok(1).and(ok(2))
```
```output
Ok(2)
```

If one `Ok` and one `Err`, always return the `Err value`
```rust
err(1).and(ok(1))
```
```output
Err(1)
```

### and_then
If `Ok`, evaluate the closure and return the `Result`
```rust
ok(1).and_then(|x| ok(x * 10))
```
```output
Ok(10)
```

On `Err` the closure won't be evaluated:
```rust
err(1).and_then(|x| ok(x * 10))
```
```output
Err(1)
```

### clamp
The utility of this method is questionable due to the unexpected rules.

A normal integer clamp works like this:
```rust
1.clamp(4, 6)
```
```output
4
```

A `Result` clamp is the same on the inner `Ok values`:
```rust
ok(1).clamp(ok(4), ok(6))
```
```output
Ok(4)
```
```rust
ok(10).clamp(ok(4), ok(6))
```
```output
Ok(6)
```

It also works if all values are `Err`: 
```rust
err(2).clamp(err(4), err(6))
```
```output
Err(4)
```

But it has different behavior when mixing `Err` and `Ok`:
```rust
err(1).clamp(ok(4), ok(6))
```
```output
Ok(6)
```
```rust
err(1).clamp(ok(4), err(6))
```
```output
Err(1)
```

If the left side of a clamp is `Err` and the right side is `Ok` it will panic:
```rust
#[ignore]
err(1).clamp(err(2), ok(6))
```
```plaintext
thread 'main' panicked at 'assertion failed: min <= max', /rustc/e092d0b6b43f2de967af0887873151bb1c0b18d3/library/core/src/cmp.rs:845:9
```

#### Alternative Example
Instead of potentially getting caught out, consider communicating your intent by handling errors on a `match` statement in a tuple, and clamp the resulting values as normal:
```rust
use rand::Rng;

let x: Result<u8, u8> = Ok(rand::thread_rng().gen());
let a = ok(100);
let b = ok(200);

let res = match (x, a, b) {
	(Ok(x), Ok(a), Ok(b)) => x.clamp(a, b),
	_ => panic!("error from vals: {x:?}, {a:?}, {b:?}"),
};

res
```
```output
200
```

## `Result<value ref>`
### as_ref
Get a reference to both the inner `Ok value` and inner `Err value`
```rust
let x = ok("heap allocated string".to_string());
print_type("original:", &x);
print_type("as_ref():", &x.as_ref());
```
```output
original:           : core::result::Result<alloc::string::String, alloc::string::String>
as_ref():           : core::result::Result<&alloc::string::String, &alloc::string::String>
```

#### Example
When you can't take ownership of the contained value, but you still need to access to it, for example in a `once_cell` with error handling:
```rust
use once_cell::sync::Lazy;

pub static GLOBAL_ERROR: Lazy<Result<i32, &'static str>> = Lazy::new(|| Err("bad error"));

// Get a reference to both the Err value and Res value
match GLOBAL_ERROR.as_ref() {
	Ok(x) => println!("ok with: {x}"),
	Err(e) => println!("not ok with: {e}"),
};
```
```output
not ok with: bad error
```

This pattern gives you the ability to perform error handling when accessing something in global state on first initialization.

### as_deref
Deref coerce the inner `Ok value` so for example a `String` would become `&str`:
```rust
let x = ok("heap allocated string".to_string());
print_type("original type", &x);
print_type("after as_ref()", &x.as_deref());
```
```output
original type       : core::result::Result<alloc::string::String, alloc::string::String>
after as_ref()      : core::result::Result<&str, &alloc::string::String>
```

#### Example
It has the same use as a normal `as_ref()` but also automatically deref coerces the `Ok value`, please raise an [issue](https://github.com/jackos/jackos.io/issues/new) if you have a good example for when this is useful where a normal reference wouldn't work.

### as_mut
Get a mutable reference to both the `Err value` and `Ok value`:
```rust
let mut x = ok("heap allocated string".to_string());
print_type("original type", &x);
print_type("after as_ref()", &x.as_mut());
```
```output
original type       : core::result::Result<alloc::string::String, alloc::string::String>
after as_ref()      : core::result::Result<&mut alloc::string::String, &mut alloc::string::String>
```

#### Example
When you want to mutate a value from inside a `match` or `if let`:
```rust
let mut heap = "heap allocated string".to_string();

match ok(&mut heap).as_mut() {
	Ok(x) => x.push_str(", wow it's mutable!"),
	Err(_) => (),
};

heap
```
```output
"heap allocated string, wow it's mutable!"
```

### as_deref_mut
Get a mutable reference to the deref coerced `Ok value`, and mutable reference to the `Err value`
```rust
let mut x = ok("heap allocated string".to_string());
print_type("original:", &x);
print_type("as_deref_mut():", &x.as_deref_mut());
```
```output
original:           : core::result::Result<alloc::string::String, alloc::string::String>
as_deref_mut():     : core::result::Result<&mut str, &mut alloc::string::String>
```

#### Example
Please raise an [issue](https://github.com/jackos/jackos.io/issues/new) if you have a good example for when mutable deref coercion is useful instead of a normal mutable reference.

## Iter
### into_iter
`Ok` iterator `Err` empty iterator
```rust
ok(10).into_iter().next()
```
```output
Some(10)
```
```rust
err(10).into_iter().next()
```
```output
None
```

#### Example
Please raise an [issue](https://github.com/jackos/jackos.io/issues/new) if you have an example when this would be useful over an `ok()`


## Unstable
None of these features have been released in `stable` yet, you can enable them by running the `+nightly` and activating the features:
```rust
#[ignore]
#![feature(option_result_contains)]
#![feature(result_contains_err)]
#![feature(result_option_inspect)]
#![feature(result_into_ok_or_err)]
```

### contains
Returns `true` if the result is `Ok` and equal to the first argument 
```rust
#[ignore]
ok(1).contains(&1)
```
```plaintext
true
```
```rust
ok(1).contains(&2)
```
```plaintext
false
```
```rust
err(1).contains(&1)
```
```plaintext
false
```

### contains_err
Returns `true` if the result is `Err` and equal to the first argument

```rust
err(1).contains_err(&1)
```
```plaintext
true
```
```rust
err(1).contains_err(&2)
```
```plaintext
false
```
```rust
ok(1).contains_err(&1)
```
```plaintext
false
```

### inspect
Run the closure if `Ok`, and return the `Ok value`
```rust
let a = ok(2).inspect(|x| println!("ok: {}", x * 10));
let b = err(2).inspect(|x| println!("err: {}", x * 10));
dbg!(a, b)
```
```plaintext
Ok(2)
Err(2)
ok: 20
```

### inspect_err
Run the closure if `Err`, and return the `Err value`
```rust
let a = err(1).inspect_err(|x| println!("err: {}", x * 10));
let b = ok(1).inspect_err(|x| println!("ok: {}", x * 10));
dbg!(a, b);
```
```plaintext
Err(1)
Ok(1)
err: 10
```

### into_ok_or_err
Only usable if the result type is `Result<T, T>` where the `Ok value` and `Err value` are the same type, will give you the value back regardless of `Err` or `Ok`:
```rust
let x: Result<u8, u8> = Err(5);
x.into_ok_or_err()
```
```plaintext
5
```

The below gives a compile-time error that the method doesn't exist for those types because they're not matching:
```rust
#[ignore]
let x: Result<u8, u16> = Err(5);
```
