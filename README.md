# Celula  

Celula is an approach to the problem of knowing with absolute certainty the actual code running in an untrusted server.  

The scope of Celula is very limited and subject to thorough review by hardware, software and systems experts. My intention is to start a discussion based on the prototype built for this purpose that will hopefully contribute to a solution to this problem.  

## Motivation  

Imagine you want to run an automated lottery on the bitcoin network. Interested parties send money to address A and after X time one of the sending addresses is selected as winner. Then the address A sends all funds back to that winning address (let’s not worry about implementation details: whether all address must send a fixed amount to be part of the lottery or the address that sends more gets a bigger chance, etc). The main problem with this lottery scheme, and with every scheme that depends on automatic action by a computer upon an observable condition, is that address's A secret key is known to the operator who controls the lottery server. Therefore he can get away with all the money and thus defraud the lottery customers. This is a particular case of automated contract execution upon observable conditions, where the executor must be held accountable as a "trusted party" (capital requirements, regulations, etc) since we cannot trust that nobody will access the lottery's secret key.  

## Problem  

> - How can I give proof that my service is actually running a given code, always.  
> - How can I give proof that nobody has user nor root access to the server.  

If I can prove that my server is always running a given code and nobody can access the server then I have a solution.  

## Previous work  

There is extensive literature on trusted computing and software attestation (I give a broad overview on [this blog post](https://www.jaime.world/2017/03/07/remote-computation/)).  

The main conclusions we can deduce from previous work are:  

- If we want to make use of the economies of scale IaaS providers offer, we do not have other option than to trust that they will enable safe cross-tenant sharing and respect the agreed contracts.  
- It is our responsibility to use software that is resistant to side-channel attacks.  

## Proposition  

There is a simple solution to the problem if the following conditions are met:  

1. We can trust that the IaaS cloud platform will enforce safe cross-tenant sharing and do not disclose our data.  
2. The IaaS cloud platform has an API for:  
    - creating VMs.  
    - creating persistent disks.  
    - encrypting persistent disks with customer supplied encryption keys.  
    - attaching persistent disks to VMs.      
    - running startup-scripts on newly created VMs.  
3. There is a script that once executed will completely block user and root access to the VM.  
4. We can trust in the first server that will expose the Celula API (the source instance).  

## Explanation  

If we meet conditions 1, 2 and 3 then we can build a service (the source instance) that will expose an API to create a virtual machine on a third party's IaaS account, attach a persistent disk to that VM encrypted with a random key, execute the startup script that will isolate the VM and then fetch the target code and start running it.  

From that moment on, the service running on the destination instance will be completely isolated and running the desired code. Therefore the source instance will issue a signed claim stating that the destination instance is effectively running a given code which can not be modified.  

The first server to expose the Celula API (source instance) becomes the root of trust on top of the IaaS. In this sense it acts as the root CA of a public key infrastructure scheme. Anyone can start an instance of Celula and register it as a source instance and therefore begin his own lineage of trust. In the [Setup section](https://github.com/celulaproject/celula#setup) we propose a ceremony that might help establishing trust with source instances and therefore enforce that the claims it generates are not tampered, malicious nor false.  

It is relevant to note that it would be possible to establish a secure communication channel between Celula instances in order to share state variables that will enable completely cloning instances if required. This way the Celula generated instances can easily scale and preserve their properties.  

## Prototype  

This prototype includes the core implementation that exposes a server that handles replication and an API endpoint for signing, verifying and querying replication claims.  

### Terminology:  

- **generation 0 (gen:0)**: the first instance to be a source instance that executes the Celula module. From the gen:0 instance are generated all other instances that will execute a Celula server and a second NodeJS module (if requested).  
- **generation N (gen:N, N > 0)**: the nth descendant of a gen:0 instance.  
- **claim**: a statement cryptographically signed by the gen:N (N >=0) instance that states the creation of gen:(N+1) instance and some if its properties.  
- **replication**: the act of requesting a Celula instane to clone itself on a third party instance and optionally deploy a third party NodeJS module.  
- **target code**: the third party NodeJS module to be launched on a destination instance.  
- **source instance**: the Celula instance that receives a replication request.  
- **destination instance**: the Celula instance that is created after a replication request.  

### Basic principle  

Each Celula instance is characterized by its key pair that define its identity. The key pair is generated using the NodeJS port of libsodium.  

When a new Celula instance is launched, it generates a key pair whose public key is exposed through the API in order to reveal its identity. When a third party makes a request to replicate, the Celula instance will query the GCE API in order to launch a new VM with an encrypted disk and running the Celula startup script. After the script is executed successfully, the source instance will query the destination instance until it's identity is available and then sign a claim stating it created such destination instance.  

From that moment on, any interested party can verify the claim made by the source instance and have proof of the state of the destination instance.  

### Current limitations  

- The prototype is implemented to work on Google Compute Engine (GCE) but it can work on any IaaS that satisfies the before mentioned conditions. ([See the GCE country restrictions here](https://cloud.google.com/compute/docs/disks/customer-supplied-encryption))  
- All communication between Celula instances is secured with self-signed certificates, therefore clients connecting to the Celula API must accept self-signed certificates.  
- Only NodeJS modules are supported for replication as target code.  
- The format of claims and the associated logic of storing and making them available must be reviewed. Maybe a DNS like system for matching public keys to an IP is also required.  
- **Important:** The [startup-script](https://github.com/celulaproject/celula/blob/master/lib/gce/startup-script.sh) and the [startup-script-celula-zero](https://github.com/celulaproject/celula/blob/master/lib/gce/utils/startup-script-celula-zero.sh) code to be launched on VM creation is prone to errors and most probably does not prevent all access from third parties. Contributions to optimize it are more than welcome (password protection for GRUB, better restriction for console login, system reboots, restricting Magic SysRq, etc).  

## Setup  

Setup is relevant for generation zero instances. There are some steps one can take in order to assure trust when launching generation zero instances on Google Compute Engine. Here we describe our approach to it:  

- Become a member of the [Celula project google group](https://groups.google.com/d/forum/celula-project).  
- Create a project on GCE to be used for launching the Celula zero instances.  
- Go to the [IAM page](https://console.cloud.google.com/iam-admin/iam/project) for your newly created project and add a new member: celula-project@googlegroups.com with _project viewer_ permissions.  
- Go to [project metadata](https://console.cloud.google.com/compute/metadata?project) and set the `key` to `startup-script` and in `value` copy the contents of the `lib/gce/utils/startup-script-celula-zero.sh` file.  
- Go to the [firewall settings for the default network](https://console.cloud.google.com/networking/networks/details/default?project) and add open the port `tcp:3141`.  
- Post a message on the Celula group indicating the link to your GCE project.  
- From that moment on, the project will be completely auditable for the members of the google group and every new instance that is created will have ssh access disabled and run a new version of the Celula core module.  

## Celula API  

The Celula API is available under https at port 3141 on every instance running Celula.  

### `GET` /id
Returns the identity of the Celula instance:  
```
{
  publicKey: 'base64String',
  generation: 'gen:N'
}
```

### `GET` /claims/:uuid  

Returns the claim by uuid  
```
{
  "id": "uuid",
  "claim": {
    "date": "ISO Date",
    "message": {
      "source": {
        "publicKey": "base64String",
        "generation": "gen:N",
        "celulaVersion": "repoVersion"
      },
      "destination": {
        "ip": "",
        "publicKey": "base64String",
        "generation": "gen:N+1",
        "repositoryUrl": "optional"
      }
    },
    "signature": "base64String"
  }
}
```


### `GET` /claims/all  

Returns an array with all signed claims by this Celula instance.  

### `POST` /sign  

Returns the signature of the requested body.

### `POST` /verify  

Verifies a given signature

### `POST` /replicate  

Replicates the Celula instance.

#### Request body:  
```
{
  "credentials": {
    "type": "service_account",
    "project_id": "",
    "private_key_id": "",
    "private_key": "-----BEGIN PRIVATE KEY-----\n-----END PRIVATE KEY-----",
    "client_email": "",
    "client_id": "",
    "auth_uri": "",
    "token_uri": "",
    "auth_provider_x509_cert_url": "",
    "client_x509_cert_url": ""
  },
  "zone": "optional:default to us-central1-c",
  "vmName": "optional",
  "machineType": "required",
  "repositoryUrl": "optional:repository url of the target code to be launched",
  "diskSizeGb": "optional:number representing GB, default to 10",
  "diskType": "optional:default to pd-standard"
}
```

The credentials object is obtained following these instructions:  

1. Visit the [Google Developers Console](https://console.developers.google.com/project)  
2. Create a new project  
3. Activate the slide-out navigation tray and select API Manager.  
4. Select Credentials from the side navigation.  
5. Find the "Add credentials" drop down and select "Service account" to be guided through downloading a new JSON key file. When  creating the service account you must enable the **Project Editor** role.  
6. Copy the key file json object under `credentials` when making the post request to replicate.  

The repositoryUrl of the target code is optional, if you specify one, the following steps will be taken:  
 - `git clone <repositoryUrl> repo && cd repo && npm install && npm start`  
 - Port 80 and 443 are available for the NodeJS process.  

If no repositoryUrl is specified, the destination instance will only run the Celula code.  

The machineType must be one of [the available types in GCE](https://cloud.google.com/compute/docs/machine-types). f1-micro is not accepted.  

The zone, if provided, must be one of [the available zones in GCE](https://cloud.google.com/compute/docs/regions-zones/regions-zones).  

The vmName, if provided, must be 1-63 characters long and match the regular expression `[a-z]([-a-z0-9]*[a-z0-9])?` which means the first character must be a lowercase letter, and all following characters must be a dash, lowercase letter, or digit, except the last character, which cannot be a dash.  

#### Response body:  

```
{"id":"fd1bf9c8-4d20-4724-be79-278fee618a53","message":"processing"}
```

Where the id is the uuid of the replication request. If replication is successfull, the corresponding claim will also be retrievable under that uuid.  

### `GET` /replicate/:uuid  

Returns the state of the replication request under that uuid.  

##  Can I use it already?  

Yes! There is a Celula-zero instance running on https://celula-project.jaime.world:3141 that complies with the setup described previously. The API is functional and therefore you can make request to have your software attested to be running a given target code and without possible modifications.  

## Feedback, comments, proposals

Absolutely needed! Please open an issue and we'll start working on it.  
Thanks!
