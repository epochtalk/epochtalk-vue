#!/usr/bin/env sh
cp $JSFOLDER/*.js /tmp

export EXISTING_VARS=$(printenv | awk -F= '{print $1}' | sed 's/^/\$/g' | paste -sd,);
for file in /tmp/*.js;
do
  cat $file | envsubst $EXISTING_VARS | tee $JSFOLDER/$(basename $file)
done
nginx -g 'daemon off;'
