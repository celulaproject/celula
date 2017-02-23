nodejs memory leaks:  
- https://auth0.com/blog/four-types-of-leaks-in-your-javascript-code-and-how-to-get-rid-of-them/  

Containers explained:  
- http://unix.stackexchange.com/questions/254956/what-is-the-difference-between-docker-lxd-and-lxc/254982  

Debugging nodejs in Docker:  
- https://lostechies.com/gabrielschenker/2016/04/19/testing-and-debugging-a-containerized-node-application/  
- http://stackoverflow.com/questions/28518535/how-to-debug-nodejs-app-running-inside-docker-container-via-google-cloud  
- https://alexanderzeitler.com/articles/debugging-a-nodejs-es6-application-in-a-docker-container-using-visual-studio-code/  
- https://github.com/bnoordhuis/node-heapdump  
  - Use env NODE_HEAPDUMP_OPTIONS=nosignal node script.js to avoid heap dumping  



Docker content Trust:  
- https://blog.docker.com/2015/08/content-trust-docker-1-8/  

Docker security:  
- https://docs.docker.com/engine/security/security/  

Installing Docker: `curl -sSL https://get.docker.com/ | sh`  

Smart contracts:  
- http://www.coindesk.com/three-smart-contract-misconceptions/  
- http://www.coindesk.com/3-common-smart-contract-misconceptions-explored/  
- https://bitsonblocks.net/2016/02/01/a-gentle-introduction-to-smart-contracts/  

Securing a server:  
- General idea: https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/4/html/Security_Guide/s2-wstation-bootloader.html  
- Ubuntu: https://help.ubuntu.com/community/Grub2/Passwords  
- Debian: https://www.debian.org/doc/manuals/securing-debian-howto/ch4.en.html  

Bash generate random string:  
- https://gist.github.com/earthgecko/3089509  

Memory protection:  
- http://stackoverflow.com/questions/33361892/how-to-read-the-variable-value-from-ram  
- https://en.wikipedia.org/wiki/Memory_protection  
- http://stackoverflow.com/questions/5656530/how-to-use-shared-memory-with-linux-in-c  
- http://stackoverflow.com/questions/33361892/how-to-read-the-variable-value-from-ram  

GCE serial console (GRUB):  
- https://cloud.google.com/compute/docs/instances/interacting-with-serial-console  

GCE block ssh keys:  
- https://cloud.google.com/compute/docs/instances/adding-removing-ssh-keys#block-project-keys  

In memory datasatore:
- Use LevelDB with MemDown: if process dies or reference is deleted the value is lost.
  - https://github.com/level/levelup  
  - https://github.com/Level/memdown  

GCE API:
- https://googlecloudplatform.github.io/google-cloud-node/#/docs/google-cloud/0.38.3/guides/authentication  
- https://github.com/GoogleCloudPlatform/compute-image-packages  
- https://cloud.google.com/compute/docs/images/create-delete-deprecate-private-images  
