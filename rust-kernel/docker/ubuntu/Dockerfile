from ubuntu:22.04
RUN apt update
RUN apt install -y \
	bc \
	bison \
	curl \
	clang \
	fish \
	flex \
	git \
	gcc \
	libclang-dev \
	libelf-dev \
	lld \
	llvm-dev \
	libncurses-dev \
	make \
	neovim \
	qemu-system-x86

ENV PATH="/root/.cargo/bin:${PATH}"
ENV MAKEFLAGS="-j16"
ENV LLVM="1"

RUN curl https://sh.rustup.rs -sSf | bash -s -- -y
RUN git clone https://github.com/rust-lang/rust-bindgen -b v0.56.0 --depth=1
RUN cargo install --path rust-bindgen

RUN git clone https://github.com/jackos/linux -b rust --depth=1
WORKDIR linux
COPY initrd.img .

RUN rustup override set $(scripts/min-tool-version.sh rustc)
RUN rustup component add rust-src

RUN make allnoconfig qemu-busybox-min.config rust.config
RUN make
