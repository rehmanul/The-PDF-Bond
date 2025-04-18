
#!/bin/bash

# Create directory for archives
mkdir -p ./zips

# Clean up any existing archive files
rm -f ./zips/okkyno_part_*.tar.gz

# Create a single tar.gz file excluding node_modules, .git, and the zips directory
echo "Creating full project archive..."
tar -czf ./zips/okkyno_full.tar.gz --exclude=./node_modules --exclude=./.git --exclude=./zips --exclude=./dist --exclude=./build .

# Get the size of the archive
archive_size=$(du -h ./zips/okkyno_full.tar.gz | cut -f1)
echo "Archive size: $archive_size"

# Split the archive into 50MB chunks
echo "Splitting into 50MB chunks..."
cd zips && split -b 50M okkyno_full.tar.gz "okkyno_part_"

# Remove the original large archive file
rm ./zips/okkyno_full.tar.gz

# Rename the split files to have .tar.gz extension
for file in ./okkyno_part_*; do
  mv "$file" "$file.tar.gz"
done

# Display information about the created files
echo -e "\nArchive files created successfully!"
echo "------------------------------"
ls -lh ./ | grep "okkyno_part_" | awk '{print $9 " (" $5 ")"}'
echo -e "\nFiles are located in the './zips' directory"
echo -e "\nTo combine these files later:"
echo "1. Place all parts in the same directory"
echo "2. Run: cat okkyno_part_* > okkyno_full.tar.gz"
echo "3. Extract with: tar -xzf okkyno_full.tar.gz"
