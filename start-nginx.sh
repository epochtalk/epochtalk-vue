#!/usr/bin/env sh
cp $JSFOLDER/*.js /tmp
cp index.html /tmp

export EXISTING_VARS=$(printenv | awk -F= '{print $1}' | sed 's/^/\$/g' | paste -sd,);
for file in /tmp/*.js;
do
  cat $file | envsubst $EXISTING_VARS | tee $JSFOLDER/$(basename $file)
done
cat /tmp/index.html | envsubst $EXISTING_VARS | tee index.html
rm /tmp/*.js
rm /tmp/index.html
nginx -g 'daemon off;'
