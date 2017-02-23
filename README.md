# Celula  

Celula is a preliminary approach to solve the problem of knowing with absolute certainty the actual code running in a server. Celula extracts analogies from the biology sphere into computer programs in order to give a software based solution for this problem.

The scope of the solution proposed in Celula is very limited and subject to thorough review by hardware and systems experts. My intention is to start a discussion based on the prototype built for this purpose that will hopefully contribute to a wider solution to this problem.

## Motivation  

Imagine you want to run an automated lottery on the bitcoin network. Interested parties send money to address A and after X time one of the sending addresses is selected as winner. Then the address A sends all funds back to that winning address (let’s not worry about implementation details: whether all address must send a fixed amount to be part of the lottery or the address that sends more gets a bigger chance, etc). The main problem with this lottery scheme, and with every scheme that depends on automatic action by a computer upon an observable condition is that address's A secret key is known to the human who controls the machine or automatic service. Therefore he can get away with all the money and thus defraud the lottery customers. As said, this is a particular case of automated contract execution upon observable conditions, where the executor must store "somewhere" the secret key, thus making it available to human operators with access to the machine. In every known system (to me at least) the execution service must therefore be held accountable as a "trusted party" (capital requirements, regulations, etc) since we cannot trust on the machine alone.  

## Problem  

Therefore, the problem can be formulated as: we need an algorithm that will assure us we can trust in a given machine, that that machine will execute a given action in response to observable conditions and most important of all, the machine can keep a secret unreachable to operators, sysadmins or anyone with physical or remote access to the machine.  

## Proposition  

We can build a system that solves the declared problem if the following conditions are met on the server that will host the code (host server):  

1. In-memory variables are not accessible to any process other than the one which created them. That is the operating system adheres to virtual address spaces and memory protection.  
2. There is a script that once executed will completely isolate the machine from external operators.  
3. We can trust in one source server (the source cell) that will execute the declared actions on the host server.  

## Explanation  

If we meet conditions 1, 2 and 3 we can build a service (the source cell) that will create a virtual machine on an external compute services provider, execute the isolation script (hijack.sh) and then fetch the code and start running the service. From that moment on, the service will be completely isolated from third parties (therefore we can be sure that the secrets don't fall into the wrong hands - or any hand at all). Also, every host server is in his turn a source cell, that is it can replicate itself onto another machine and preserve its memory state. By such we can be sure that there are sufficient process running simultaneously and thus the secrets will prevail to system crashes or reboots. Since everything is in memory only a reboot or system overload will reset the machine and thus loose its state. Therefore the importance of replication in multiple machines.  
