#!/bin/bash
basedir=$(cd `dirname $0`; pwd)
rootdir=$(cd $basedir/..; pwd)

if curl -XPOST 'http://localhost:5001/api/v0/refs/local' &>/dev/null; then
    echo "INFO: IPFS has been already started:$(curl -s -XPOST 'http://localhost:5001/api/v0/version')"
    exit 0
fi

tryout=3
i=0
targetPkg="go-ipfs_v0.12.0_linux-amd64.tar.gz"
IPFS_PATH=$(which ipfs)
if [ x"$IPFS_PATH" = x"" ]; then
    IPFS_PATH=$rootdir/bin/ipfs
fi
while true; do
    if [ ! -e "$IPFS_PATH" ]; then
        echo "INFO: installing IPFS..."
        wget -P $rootdir "https://github.com/ipfs/go-ipfs/releases/download/v0.12.0/$targetPkg"
        if [ $? -eq 0 ]; then
            cd $rootdir
            tar -xvf $targetPkg
            mkdir -p bin
            mv go-ipfs/ipfs bin
            path="export PATH=\$PATH:$rootdir/bin"
            if ! grep "$path" ~/.bashrc &>/dev/null; then
                echo "$path" >> ~/.bashrc
                source ~/.bashrc
            fi
            rm -rf go-ipfs*
            echo "INFO: install IPFS successfully"
            cd - &>/dev/null
            if [ -e "$HOME/.ipfs" ]; then
                ipfsdirBak=$HOME/.ipfs.$(date '+%Y%m%d%H%M%S')
                echo "WARN: find old ipfs directory, rename it to $ipfsdirBak"
                mv $HOME/.ipfs $ipfsdirBak
            fi
            $IPFS_PATH init
            break
        fi
    else
        break
    fi
    if [ $((i++)) -ge $tryout ]; then
        echo "ERROR: install IPFS failed"
        exit 1
    else
        echo "INFO: try installing IPFS again($i)"
    fi
done

echo "INFO: $($IPFS_PATH --version)"
echo "INFO: starting IPFS..."
nohup $IPFS_PATH daemon &>/dev/null &

i=0
while true; do 
    if curl -XPOST 'http://localhost:5001/api/v0/refs/local' &>/dev/null; then
        echo "INFO: IPFS has been started successfully"
        exit 0
    fi
    if [ $((i++)) -ge $tryout ]; then
        break
    else
        sleep 5
    fi
done
echo "ERROR: start IPFS failed!"
exit 1
