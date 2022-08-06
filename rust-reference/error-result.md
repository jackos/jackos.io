# Result 
This is reference for everything you can do with a `Result`, with examples when you might want to use these methods.

First we'll set up two simple methods, one returning a `Error` and another returning a `Ok` result, both will contain the value passed in:
```rust
fn err(x: u8) -> Result<u8, u8> {
	Err(x)	
}

fn ok(x: u8) -> Result<u8, u8> {
	Ok(x)	
}
```

On panic the `Error value` will use the `Debug` implementation to print the value:
```
err(1).unwrap()
```
```
thread 'main' panicked at 'called `Result::unwrap()` on an `Err` value: 1', src/main.rs:58:16
```

Note: To create these docs I use a `VS Code` extension I created called `codebook`, if the last line is an expression with no semicolon at the end, it will print the `Debug` implementation.

## and
This works just like a normal `&&` statement but with a `Result`

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

### When would I use this?

If you're chaining multiple `Result` checks, and you only care about the final `Ok value`, or you don't care about any of them:
```rust
use rand::Rng;
fn might_fail(r: u8) -> Result<u8, u8> {
	if r > 64 {
		Ok(r)
	} else {
		Err(r)
	}
}

let r: u8 = rand::thread_rng().gen();
println!("x:{}", r);
let x = might_fail(r);

let r: u8 = rand::thread_rng().gen();
println!("y:{}", r);
let y = might_fail(r);

if let Ok(y) = x.and(y) {
	println!("x and y were both OK, but I only care about y: {y}");
} else {
	println!("noooooo!!!")
}
```
```output
x:65
y:137
x and y were both OK, but I only care about y: 137
```

### When would I not use this?
You might need access to both `Ok values`, in which case you can use an `if let` with a tuple:
```rust
if let (Ok(a), Ok(b)) = (ok(1), ok(2)) {
	println!("a:{a} b:{b}");
};
```
```output
a:1 b:2
```

Or if you need to handle errors you can match on the tuple:
```rust
let (a, b) = match (ok(1), ok(2)) {
	(Ok(a), Ok(b)) => (a, b),
	(Err(e1), Err(e2)) => panic!("error 1: {e1} error 2: {e2}"),
	_ => panic!("some other combination"),
};
(a, b)
```
```output
(1, 2)
```

## and then
If both are `Ok`, evaluate `right` and return it

`Ok` on both sides will evaluate the right side and return it:
```rust
ok(1).and_then(|x| ok(x * 10))
```
```output
Ok(10)
```

Any `Result` or `Option` method that ends in `then` is lazy, which means the `closure` on the right side won't evaluate if the left side is a `Err`, for example:
```rust
err(1).and_then(|x| ok(x * 10))
```
```output
Err(1)
```

### When would I use this?
It's the same as `and`, except it's useful if you have an expensive calculation, or you need to do something more complicated than just return the second `Ok value`
```rust
let r: u8 = rand::thread_rng().gen();
println!("x:{}", r);
let x = might_fail(r);

let r: u8 = rand::thread_rng().gen();
println!("y:{}", r);
let y = might_fail(r);

x.and_then(|i| {
	println!("pretend this is a real expensive calc with x: {i}");
	y
});
```
```output
x:123
y:156
pretend this is a real expensive calc with x: 123
```
```rust
## as_ref
```
