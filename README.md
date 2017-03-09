# Celula  

Celula is an approach to solve the problem of knowing with absolute certainty the actual code running in a server: remote software attestation. Celula extracts analogies from the biology sphere into computer programs and networks in order to propose a software based solution for this problem.

The scope of Celula is very limited and subject to thorough review by hardware, software and systems experts. My intention is to start a discussion based on the prototype built for this purpose that will hopefully contribute to a wider solution to this problem.  

## Motivation  

Imagine you want to run an automated lottery on the bitcoin network. Interested parties send money to address A and after X time one of the sending addresses is selected as winner. Then the address A sends all funds back to that winning address (let’s not worry about implementation details: whether all address must send a fixed amount to be part of the lottery or the address that sends more gets a bigger chance, etc). The main problem with this lottery scheme, and with every scheme that depends on automatic action by a computer upon an observable condition is that address's A secret key is known to the operator who controls the lottery server. Therefore he can get away with all the money and thus defraud the lottery customers. This is a particular case of automated contract execution upon observable conditions, where the executor must be held accountable as a "trusted party" (capital requirements, regulations, etc) since we cannot trust that nobody will access the lottery's secret key.  

## Problem  

> How can I give a server an identity? That is, the ability to store cryptographic keys that no third party can alter or access and which can be preserved over time.  

This problem is equivalent to solving two separate problems:  
- How can I give proof that my service is actually running a given code, always.
- How can I give proof that nobody has physical or remote access to the server.

If I can give proof that my server is always running a given code and nobody can access the server then if that code exposes a cryptographic signing, encrypting and decrypting API I have solved my problem.  


## Previous work  

There is extensive literature on trusted computing and software attestation (I give a broad overview on [this blog post](https://www.jaime.world/2017/03/07/remote-computation/)).  

The main conclusions we can deduce from previous work are:  

- Apparently we do not have other option than to trust the Infrastructure as a service providers (Iaas) that they will enable safe cross-tenant sharing, that is if we want to make use of the amazing economies of scale they offer.  
- It is our responsibility to use software that is resistant to side-channel attacks.  

## Proposition  

There is a simple solution to the problem if the following conditions are met:  

1. We can trust that the IaaS cloud platform will enforce safe cross-tenant sharing.  
2. The IaaS cloud platform has an API for:  
    - creating VMs.  
    - creating persistent disks.  
    - encrypting persistent disks with customer supplied encryption keys.  
    - attaching persistent disks to VMs.      
    - running startup-scripts on newly created VMs.  
3. There is a script that once executed will completely isolate the machine from external operators with physical or remote access to the VM.  
4. We can trust in the first server that will expose the Celula API (the source cell).  

## Explanation  

If we meet conditions 1, 2 and 3 then we can build a service (the source cell) that will expose an API to create a virtual machine on an third party IaaS account, attach a persistent disk to that VM encrypted with a random key, execute the startup script that will isolate the VM and then fetch the required code and start running the target service.  
From that moment on, the service will be completely isolated from third parties and running the desired code.  

The first server to expose the Celula API (source cell) becomes the root of trust (on top of the IaaS) since we have no way to ascertain that it is effectively running the Celula code and not keeping any concealed information or providing false claims. In this sense it acts as the root CA of public key infrastructure scheme. Anyone can start an instance of Celula and register it as a Generation zero server and therefore begin his own lineage of trust.  

Afterwards it is possible to establish a secure communication channel between Celula instances in order to share state variables that will enable completely cloning instances including code and generated keys if required. This way the Celula instances can easily scale and preserve their properties.  

## Prototype  

This prototype includes the core implementation that exposes a server that handles replication and an API endpoint for signing, verifying and querying generation claims.  

### Terminology:  

- generation 0 (gen:0): the first instance that executes the Celula module. From the gen:0 instance are generated all other instances that will execute a Celula server and a second NodeJS module (if requested).  
- generation N (gen:N, N > 0): the nth descendant of a gen:0 instance.  
- claim: a statement cryptographically signed by the gen:N (N >=0) instance that states the creation of gen:(N+1) instance and some if its properties.  
- replication: the act of requesting a Celula instane to clone itself on a third party instance and optionally deploy a third party NodeJS module.  

### Limitations  

- The prototype is implemented to work on Google Compute Engine but it can work on any IaaS that satisfies the before mentioned conditions.  
- All communication between Celula instances is secured with self-signed certificates, therefore clients connecting to the Celula API must accept self-signed certificates.  
- Only NodeJS modules are supported for replication.  
- The startup-script to be launched on VM creation is prone to errors and most probably does not prevent all access from third parties. Contributions to optimize it are more than welcome (password protection for GRUB, better restriction for console login, system reboots, restricting Magic SysRq, etc).  

## Setup  

In order to launch a generation zero instance:  
- git clone
- cd celula && npm install
- npm start  

If you wish to provide a certain degree of trust in your generation zero instance use zeit command line tool to freely create a server that will expose its contents.  

## Celula API  
