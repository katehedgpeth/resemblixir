#!/bin/sh
"$@"
pid=$!
echo $pid
while read line ; do
    :
done
kill -KILL $pid
