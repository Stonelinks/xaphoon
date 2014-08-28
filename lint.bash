find public/js/ -type f -name "*.js" -exec fixjsstyle '{}' \;
find events/ -type f -name "*.js" -exec fixjsstyle '{}' \;
find models/ -type f -name "*.js" -exec fixjsstyle '{}' \;
find collections/ -type f -name "*.js" -exec fixjsstyle '{}' \;
fixjsstyle *.js
