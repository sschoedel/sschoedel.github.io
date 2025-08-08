FROM ubuntu:22.04
ENV DEBIAN_FRONTEND noninteractive

Label MAINTAINER Amir Pourmand

RUN apt-get update -y && apt-get install -y --no-install-recommends \
    locales \
    imagemagick \
    ruby-full \
    build-essential \
    zlib1g-dev \
    jupyter-nbconvert \
    inotify-tools procps \
    nodejs \
    python3 \
    python3-pip \
    python-is-python3 \
    libgl1-mesa-glx \
    libgl1-mesa-dri \
    libgconf-2-4 \
    libgtk-3-0 \
    libgconf2-dev \
    libnss3 \
    libasound2 \
    libxtst6 \
    libxss1 && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*


RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && \
    locale-gen


ENV LANG=en_US.UTF-8 \
    LANGUAGE=en_US:en \
    LC_ALL=en_US.UTF-8 \
    JEKYLL_ENV=production

# install jekyll and dependencies
RUN gem install jekyll bundler

RUN mkdir /srv/jekyll

ADD Gemfile Gemfile.lock /srv/jekyll/

WORKDIR /srv/jekyll

RUN bundle install --no-cache
# && rm -rf /var/lib/gems/3.1.0/cache
EXPOSE 8080

COPY bin/entry_point.sh /tmp/entry_point.sh

# Normalize potential CRLF line endings from Windows checkout
RUN sed -i 's/\r$//' /tmp/entry_point.sh && chmod +x /tmp/entry_point.sh

CMD ["/tmp/entry_point.sh"]
