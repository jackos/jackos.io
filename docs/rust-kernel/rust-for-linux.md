# Rust linux kernel development

## Introduction

This is following on from a [talk I really enjoyed](https://www.youtube.com/watch?v=-l-8WrGHEGI) on how to create a linux kernel module using rust, but the presenter ran out of time. Please watch that video if you want more background on rust and why it's desirable in the kernel, this will be aimed towards people already familiar with the language.

We'll be working off [jackos/linux](https://github.com/jackos/linux) which is a fork from [Rust-for-Linux/linux](https://github.com/Rust-for-Linux/linux), which itself forks from [torvalds/linux](https://github.com/torvalds/linux)

Raise a [pull request](https://github.com/jackos/jackos.io/compare) or [issue](https://github.com/jackos/jackos.io/issues/new) for any problems you have with this tutorial at: [jackos/jackos.io](https://github.com/jackos/jackos.io).

## Virtualization

You'll need to enable virtualization on your CPU in the bios, the steps to take are different depending on your motherboard and CPU. It may be called `SVM`, `AMD-V`, `Intel Virtualization` or something similar. Enable one of those options if you can find them, otherwise google something like `virtualization amd asus` or `virtualization intel gigabyte`

## Dependencies

Choose an option below and follow the steps

<CodeGroup>

  <CodeGroupItem title="docker">

```bash:no-line-numbers
# Download and run the docker container
docker run -it jackosio:rust-linux
```

  </CodeGroupItem>

  <CodeGroupItem title="arch">

```bash:no-line-numbers
# Install required packages
sudo pacman -Syuu --noconfirm bc bison curl clang diffutils flex git gcc llvm libelf lld ncurses make qemu-system-x86

# Save these to your ~/.bashrc or similar and start a new terminal session 
export PATH="/root/.cargo/bin:${PATH}"
export MAKEFLAGS="-j16"
export LLVM="1"

# If you don't have rustup installed
curl https://sh.rustup.rs -sSf | bash -s -- -y

# Install the bindgen version required by the project
git clone https://github.com/rust-lang/rust-bindgen -b v0.56.0 --depth=1
cargo install --path rust-bindgen

# Clone the `Rust for Linux` repo
git clone https://github.com/jackos/linux -b tutorial-start --depth=1
cd linux

# Set your rustc version to the current version being used with Rust for Linux
rustup override set $(scripts/min-tool-version.sh rustc)
rustup component add rust-src

# Do an initial minimal build to make sure everything is working
make allnoconfig qemu-busybox-min.config rust.config
make

```

  </CodeGroupItem>


  <CodeGroupItem title="ubuntu" active>

```bash:no-line-numbers
# Install required packages
sudo apt update
sudo apt install -y bc bison curl clang fish flex git gcc libclang-dev libelf-dev lld llvm-dev libncurses-dev make neovim qemu-system-x86

# Save these to your ~/.bashrc or similar and start a new terminal session 
export PATH="/root/.cargo/bin:${PATH}"
export MAKEFLAGS="-j16"
export LLVM="1"

# If you don't have rustup installed
curl https://sh.rustup.rs -sSf | bash -s -- -y

# Install the bindgen version required by the project
git clone https://github.com/rust-lang/rust-bindgen -b v0.56.0 --depth=1
cargo install --path rust-bindgen

# Clone the `Rust for Linux` repo
git clone https://github.com/jackos/linux -b tutorial-start --depth=1
cd linux

# Set your rustc version to the current version being used with Rust for Linux
rustup override set $(scripts/min-tool-version.sh rustc)
rustup component add rust-src

# Do an initial minimal build to make sure everything is working
make allnoconfig qemu-busybox-min.config rust.config
make
```
  </CodeGroupItem>
</CodeGroup>

## IDE

If you're using `vscode` and `docker` you can connect into the docker container using the [Remote Development](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack) extension, and install `rust-analyzer` after connecting to it. We'll add `rust-analyzer` support in a later step which will work with any editor supporting `lsp` such as `neovim` and `helix`.

## Adding the Rust module

The module we'll be creating is called `VDev` short for `Virtual Device`, we'll add it to the `Kconfig`, so the `Makefile` configuration can find it:

#### linux/samples/rust/Kconfig

```txt
config SAMPLE_RUST_VDEV
	tristate "Virtual Device"
	help
	  This option builds the Rust virtual device module sample.

	  To compile this as a module, choose M here:
	  the module will be called rust_vdev.

	  If unsure, say N.
```

We also to specify where the `Makefile` can find the object file:
#### linux/samples/rust/Makefile
```make
obj-$(CONFIG_SAMPLE_RUST_VDEV) 			+= rust_vdev.o
```

Now let's create a new file and write a minimal module:
#### linux/samples/rust/rust_vdev.rs
```rust
//! Virtual Device Module
use kernel::prelude::*;

module! {
    type: VDev,
    name: b"vdev",
    license: b"GPL",
}

struct VDev;

impl kernel::Module for VDev {
    fn init(_name: &'static CStr, _module: &'static ThisModule) -> Result<Self> {
        // Print a banner to make sure our moudle is working
        pr_info!("------------------------\n");
        pr_info!("starting virtual device!\n");
        pr_info!("------------------------\n");
        Ok(VDev)
    }
}
```
The `module!` macro takes care of all the boilerplate, we'll build and run the VM next to make sure everything is working.

[2: module working - file changes](https://github.com/jackos/linux/commit/7551eb533fb45e9cacf2b9d1098ce9552d60b65a)

## Building and running the Kernel
The following command will bring up a `TUI` for setting the build configuration interactively, we need to enable our sample module:
```bash:no-line-numbers
make menuconfig
```
Follow the menu items, checking any boxes as you go with `space`:
  - Kernel Hacking:     `enter`
  - Sample kernel code: `space` + `enter`
  - Rust Samples:       `space` + `enter`
  - Virtual Device:     `space` + `enter`
- Press exit three times and save config

Run `make` and start the kernel in a VM:

```bash
make
qemu-system-x86_64 -nographic -kernel vmlinux -initrd initrd.img -nic user,model=rtl8139,hostfwd=tcp::5555-:23
```
If all went well you should see:
```plaintext
[0.623465] vdev: -----------------------
[0.623629] vdev: initialize vdev module!
[0.677356] vdev: -----------------------
```
Somewhere in the terminal

## Restarting the kernel
If you want to reload on file changes you can initialize a "hello world" repo and run `cargo watch` with the `-s` flag: 
```bash:no-line-numbers
cargo init .
cargo install cargo-watch
cargo watch -w ./samples/rust/rust_vdev.rs -cs 'make && qemu-system-x86_64 -nographic -kernel vmlinux -initrd initrd.img -nic user,model=rtl8139,hostfwd=tcp::5555-:23'
```
If you just want to run normal commands without the `Makefile`, in the running the `qemu` virtualization you can turn it off and start it again by running the commands:
```bash:no-line-numbers
poweroff
make
qemu-system-x86_64 -nographic -kernel vmlinux -initrd initrd.img -nic user,model=rtl8139,hostfwd=tcp::5555-:23
```
We can also add it to the `Makefile` to make it easier to run the command:
#### linux/Makefile
```Makefile
PHONY += rustwatch
rustwatch:
	$(Q) cargo watch -w ./samples/rust/rust_vdev.rs -cs 'make && qemu-system-x86_64 -nographic -kernel vmlinux -initrd initrd.img -nic user,model=rtl8139,hostfwd=tcp::5555-:23'

PHONY += rustvm
rustvm:
	$(Q) make && qemu-system-x86_64 -nographic -kernel vmlinux -initrd initrd.img -nic user,model=rtl8139,hostfwd=tcp::5555-:23
```
Now we can run the commands:
```bash
# Rebuild and start the VM
make rustvm
# Start a watch, which will rebuild and start the VM on file changes
make rustwatch
```
[3: add watch - file changes](https://github.com/jackos/linux/commit/8cd8c7965e18f272d3cb50844d55b43c1960abdb)
## Fix Rust Analyzer
`rust-analyzer` is a `Language Sever Protocol (lsp)` implementation that provides features like `completions` and `go to definition`, to get it to work with our project run:
```sh
make rust-analyzer
```
This produces a `rust-project.json` allowing `rust-anlyzer` to parse a project without a `Cargo.toml`, we need to do this because `rustc` is being invoked directly by the `Makefile`.

Now that we have Rust Analyzer working I highly recommend you make use of `Go to Definition` to see how everything has been implemented. We're not using the `std` for our core functionality, we're using custom kernel implementations that are suited to the `C` bindings. E.g. a mutex lock will not return a poison `Result` because we don't want the whole kernel to panic if a single thread panics.

## Register device
All the below changes are on `linux/samples/rust/rust_vdev.rs`

Add these imports:
```rust
use kernel::file::{File, Operations};
use kernel::{miscdev, Module};
```

Change the `VDev` struct to allow us to register a device into the `/dev/` folder
```rust
struct VDev {
    _dev: Pin<Box<miscdev::Registration<VDev>>>,
}
```

Change our `Module` implementation for `VDev`, you can see that `miscdev::Registration` is being called with an argument of `vdev`, so the device will be named `/dev/vdev`
```rust
impl Module for VDev {
    fn init(_name: &'static CStr, _module: &'static ThisModule) -> Result<Self> {
        pr_info!("-----------------------\n");
        pr_info!("initialize vdev module!\n");
        pr_info!("watching for changes...\n");
        pr_info!("-----------------------\n");
        Ok(VDev)
        let reg = miscdev::Registration::new_pinned(fmt!("vdev"), ())?;
        Ok(Self { _dev: reg })
    }
}
```

Add the minimal implementation for a device which will print "File was opened" when we perform a `cat /dev/vdev`
```rust
#[vtable]
impl Operations for VDev {
    fn open(_context: &(), _file: &File) -> Result {
        pr_info!("File was opened\n");
        Ok(())
    }
}
```
[4: register device - file changes](https://github.com/jackos/linux/commit/c5514d8d909c30cb756fb25126c13d1a771b0028)


## Implement Read and Write
We're going to allow multiple threads to read and write from a place in memory, so we need a `Mutex`, we'll use `smutext` short for `simple mutex`, a custom kernel mutex that doesn't return a poison `Result` on `lock()`.

Add the imports
```rust
use kernel::io_buffer::{IoBufferReader, IoBufferWriter};
use kernel::sync::smutex::Mutex;
use kernel::sync::{Ref, RefBorrow};
```

Add a struct representing a `Device` to hold onto data and track its own number
```rust
struct Device {
    number: usize,
    contents: Mutex<Vec<u8>>,
}
```

Now let's add the correct associated types to the `Operations` implementation and add the `read` and `write` methods:
```rust
impl Operations for VDev {
    // The data that is passed into the open method 
    type OpenData = Ref<Device>;
    // The data that is returned by running an open method
    type Data = Ref<Device>;

    fn open(context: &Ref<Device>, _file: &File) -> Result<Ref<Device>> {
        pr_info!("File for device {} was opened\n", context.number);
        Ok(context.clone())
    }

    // Read the data contents and write them into the buffer provided
    fn read(
        data: RefBorrow<'_, Device>,
        _file: &File,
        writer: &mut impl IoBufferWriter,
        offset: u64,
    ) -> Result<usize> {
        pr_info!("File for device {} was read\n", data.number);
        let offset = offset.try_into()?;
        let vec = data.contents.lock();
        let len = core::cmp::min(writer.len(), vec.len().saturating_sub(offset));
        writer.write_slice(&vec[offset..][..len])?;
        Ok(len)
    }

    // Read from the buffer and write the data in the contents after locking the mutex
    fn write(
        data: RefBorrow<'_, Device>,
        _file: &File,
        reader: &mut impl IoBufferReader,
        _offset: u64,
    ) -> Result<usize> {
        pr_info!("File for device {} was written\n", data.number);
        let copy = reader.read_all()?;
        let len = copy.len();
        *data.contents.lock() = copy;
        Ok(len)
    }
}
```
[5: read and write - file changes](https://github.com/jackos/linux/commit/eaa80f91cbcc2ddce334583bbfca15e500515fca)

Now this is all set up start the vm, if you set up the make command:
```bash
make rustvm
```
Or to just run the command:
```bash
qemu-system-x86_64 -nographic -kernel vmlinux -initrd initrd.img -nic user,model=rtl8139,hostfwd=tcp::5555-:23
```
When in the VM run the commands:
```bash
echo "wow it works" > /dev/vdev
cat /dev/vdev
```

If everything is working you should see:
```plaintext
echo "wow it works" > /dev/vdev
[41.498265] vdev: File for device 1 was opened
[41.498564] vdev: File for device 1 was written
cat /dev/vdev
[65.435708] vdev: File for device 1 was opened
[65.436339] vdev: File for device 1 was read
wow it works
[65.436712] vdev: File for device 1 was read
```

## Using kernel parameters
We're now going to set up a kernel parameter which we can change when we start the VM to modify behavior, in this case it'll start more devices

Add the flags import:
```rust
use kernel::file::{flags, File, Operations};
```

Modify the `module!` macro so that it now contains a parameter, `devices` will be the name of the parameter which can be accessed from `vdev.devices`:

```rust
module! {
    type: VDev,
    name: b"vdev",
    license: b"GPL",
    params: {
        devices: u32 {
            default: 1,
            permissions: 0o644,
            description: b"Number of virtual devices",
        },
    },
}
```

Let's change the structure of our devices so that it's a vec now:

```rust
struct VDev {
    _devs: Vec<Pin<Box<miscdev::Registration<VDev>>>>,
}
```

Update the `open` method to clear the data if it's opened in `write only` mode

```rust
fn open(context: &Ref<Device>, file: &File) -> Result<Ref<Device>> {
    pr_info!("File for device {} was opened\n", context.number);
    if file.flags() & flags::O_ACCMODE == flags::O_WRONLY {
        context.contents.lock().clear();
    }
    Ok(context.clone())
}
```

Update the write method to increase the size of the vec if required instead of allocating new memory

```rust
fn write(
        data: RefBorrow<'_, Device>,
        _file: &File,
        reader: &mut impl IoBufferReader,
        _offset: u64,
        offset: u64,
    ) -> Result<usize> {
        pr_info!("File for device {} was written\n", data.number);
        let copy = reader.read_all()?;
        let len = copy.len();
        *data.contents.lock() = copy;
        let offset = offset.try_into()?;
        let len = reader.len();
        let new_len = len.checked_add(offset).ok_or(EINVAL)?;
        let mut vec = data.contents.lock();
        if new_len > vec.len() {
            vec.try_resize(new_len, 0)?;
        }
        reader.read_slice(&mut vec[offset..][..len])?;
        Ok(len)
    }
```

Update the `Module` impl for `VDev` so that the same amount of devices are registered as specified by the kernel param.

```rust
impl Module for VDev {
  fn init(_name: &'static CStr, module: &'static ThisModule) -> Result<Self> {
      let count = {
          let lock = module.kernel_param_lock();
          (*devices.read(&lock)).try_into()?
      };
      pr_info!("-----------------------\n");
      pr_info!("starting {} vdevices!\n", count);
      pr_info!("watching for changes...\n");
      pr_info!("-----------------------\n");
      let mut devs = Vec::try_with_capacity(count)?;
      for i in 0..count {
          let dev = Ref::try_new(Device {
              number: i,
              contents: Mutex::new(Vec::new()),
          })?;
          let reg = miscdev::Registration::new_pinned(fmt!("vdev{i}"), dev)?;
          devs.try_push(reg)?;
      }
      Ok(Self { _devs: devs })
    }
}
```

Now we can change the Makefile adding the argument: `-append "vdev.devices=4"`

```Makefile
PHONY += rustwatch
rustwatch:
	$(Q) cargo watch -w ./samples/rust/rust_vdev.rs -cs 'make && qemu-system-x86_64 -append "vdev.devices=4" -nographic -kernel vmlinux -initrd initrd.img -nic user,model=rtl8139,hostfwd=tcp::5555-:23'

PHONY += rustvm
rustvm:
	$(Q) make && qemu-system-x86_64 -append "vdev.devices=4" -nographic -kernel vmlinux -initrd initrd.img -nic user,model=rtl8139,hostfwd=tcp::5555-:23
```

And then running `rustvm` or `rustwatch`

Or if you want to run the commands directly:

```bash
make
qemu-system-x86_64 -append "vdev.devices=4" -nographic -kernel vmlinux -initrd initrd.img -nic user,model=rtl8139,hostfwd=tcp::5555-:23
```
[final file](https://github.com/jackos/linux/blob/2c944f4bc399e07ba7bc6ec95925f503221bfa06/samples/rust/rust_vdev.rs)


## Repo areas of interest
Now that you have a general idea of how to write your own module, take a look around in the repo, some areas of interest are:
- `linux/rust`
- `linux/rust/kernel`
- `linux/Documentation/rust`

And don't forget to have a look through all the samples and play around with them if you're interested:
- `linux/samples/rust`

You can activate whichever ones you want with `make menuconfig` as before

That's it, thanks for reading, and please don't hesitate to raise an issue at: [github:jackos/jackos.io](https://github.com/jackos/jackos.io) if you have any suggestions or problems with this content.

I look forward to seeing your pull requests in the linux kernel!
