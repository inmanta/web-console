# cleanup containers after running test suit.
cd temp/local-setup
yarn run kill:container

# delete temp folder that was created.
cd ../..
rm -rf temp