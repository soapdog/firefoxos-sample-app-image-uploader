#!/bin/bash

FILE="imgur.zip"

if [ -f $FILE ];
then
   echo "Build File $FILE exists. Removing"
   rm $FILE
fi

echo "Zipping"

zip -r imgur.zip *


