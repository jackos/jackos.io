from archlinux:latest
RUN pacman -Sy archlinux-keyring --noconfirm
RUN pacman -Scc --noconfirm
RUN pacman-key --init
RUN pacman-key --populate archlinux
RUN pacman -Syuu --noconfirm \
	bc \
	bison \
	curl \
	clang \
	diffutils \
	flex \
	git \
	gcc \
	llvm \
	libelf \
	lld \
	ncurses \
	make \
	qemu-system-x86

ENV PATH="/root/.cargo/bin:${PATH}"
ENV MAKEFLAGS="-j16"
ENV LLVM="1"

RUN curl https://sh.rustup.rs -sSf | bash -s -- -y
RUN git clone https://github.com/rust-lang/rust-bindgen -b v0.56.0 --depth=1
RUN cargo install --path rust-bindgen

RUN git clone https://github.com/jackos/linux -b tutorial-start --depth=1
WORKDIR linux
COPY initrd.img .

RUN rustup override set $(scripts/min-tool-version.sh rustc)
RUN rustup component add rust-src

RUN make allnoconfig qemu-busybox-min.config rust.config
RUN make
