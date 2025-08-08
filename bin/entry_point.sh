#!/bin/bash

set -euo pipefail

CONFIG_FILE=_config.yml

echo "Entry point script running"

if [ -f Gemfile ]; then
  echo "Installing/updating gems..."
  bundle install --no-cache
fi

echo "Starting Jekyll..."
/bin/bash -c "exec bundle exec jekyll serve --watch --port=8080 --host=0.0.0.0 --livereload --verbose --trace --force_polling" &

while true; do

  inotifywait -q -e modify,move,create,delete $CONFIG_FILE

  if [ $? -eq 0 ]; then
 
    echo "Change detected to $CONFIG_FILE, restarting Jekyll"

    jekyll_pid=$(pgrep -f jekyll || true)
    if [ -n "${jekyll_pid}" ]; then
      kill -KILL $jekyll_pid
    fi

    if [ -f Gemfile ]; then
      echo "Re-installing/updating gems after config change..."
      bundle install --no-cache
    fi

    /bin/bash -c "exec bundle exec jekyll serve --watch --port=8080 --host=0.0.0.0 --livereload --verbose --trace --force_polling" &

  fi

done
