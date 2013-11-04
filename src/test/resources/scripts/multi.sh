#! /bin/bash
## Example usage: ./multi.sh ../urls/top100.txt
JAVA_HEAP=1024
## read the urls
URLS=()
while read txt ; do
   URLS[${#URLS[@]}]=$txt
done < $1

NR_OF_URLS=${#URLS[@]}
echo "Will test $NR_OF_URLS urls"

for url in "${URLS[@]}"
do echo "Test $url"   
    if [[ "$url" != http* ]]
    then
	url=http://$url
    fi
    java -Xmx"$JAVA_HEAP"m -Xms"$JAVA_HEAP"m  -jar ../../../../target/browsertime-0.2-SNAPSHOT-full.jar -n 1 $url
done
