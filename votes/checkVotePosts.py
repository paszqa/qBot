import os
import sys
voteFile = open('/home/pi/qBot/votes/voteposts.csv', 'r')
votePosts = voteFile.readlines()
postId = sys.argv[1]
for line in votePosts:
    if str(postId) in line:
        print("Found")
        sys.exit(0)
sys.exit(1)

