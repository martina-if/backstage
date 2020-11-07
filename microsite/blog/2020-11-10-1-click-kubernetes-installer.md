---
title: New Cost Insights plugin: The engineer’s solution to taming cloud costs
author: Martina Iglesias Fernández
authorURL: https://twitter.com/martina_if
---


- Before
  - current architecture
- How to
  - create AWS cluster or GKE cluster
  - clone backstage repo
  - configure values
  - helm install


### Creating a Kubernetes cluster

<!-- Let's say you have a domain name called `mydomain.com` and you want to deploy a sample Backstage application in
Kubernetes. -->

First, you will need a Kubernetes cluster to host Backstage. If you already have one you can skip to the next section.

If you don't, you can easily create one in AWS with [`eksctl`](https://eksctl.io), the official AWS tool to create
managed Kubernetes clusters in [EKS][eks]. First install the tool (more options [here]):

```bash
brew tap weaveworks/tap
brew install weaveworks/tap/eksctl # Install the official AWS tool to create EKS Kubernetes clusters
```

Now create a cluster (check [`eksctl`'s documentation][eksctl-create] for more information on the different
configuration options):

```bash
$ eksctl create cluster  --name backstage-demo-cluster
[ℹ]  eksctl version 0.28.0
[ℹ]  using region eu-west-1
[ℹ]  nodegroup "ng-dd29781b" will use "ami-0c504dda1302b182f" [AmazonLinux2/1.17]
[ℹ]  using Kubernetes version 1.17
[ℹ]  creating EKS cluster "backstage-demo-cluster" in "eu-west-1" region with un-managed nodes
[ℹ]  2 sequential tasks: { create cluster control plane "backstage-demo-cluster", 2 sequential sub-tasks: { no tasks, create nodegroup "ng-dd29781b" } }
[ℹ]  building cluster stack "eksctl-backstage-demo-cluster-cluster"
[ℹ]  deploying stack "eksctl-backstage-demo-cluster-cluster"
[ℹ]  building nodegroup stack "eksctl-backstage-demo-cluster-nodegroup-ng-dd29781b"
[ℹ]  deploying stack "eksctl-backstage-demo-cluster-nodegroup-ng-dd29781b"
[ℹ]  waiting for the control plane availability...
[✔]  saved kubeconfig as "/home/martina/.kube/config"
...
[✔]  all EKS cluster resources for "backstage-demo-cluster" have been created
[ℹ]  waiting for at least 2 node(s) to become ready in "ng-dd29781b"
[ℹ]  node "ip-192-168-13-10.eu-west-1.compute.internal" is ready
[ℹ]  node "ip-192-168-82-161.eu-west-1.compute.internal" is ready
[ℹ]  kubectl command should work with "/home/martina/.kube/config", try 'kubectl get nodes'
[✔]  EKS cluster "backstage-demo-cluster" in "eu-west-1" region is ready
```

This command creates an EKS cluster with 2 `m5.large` instances in your default AWS region. It should take about 10 to
15 minutes to complete. After that, your `kubectl` command should also be configured and ready to access the cluster.

<!-- TODO Add instructions for GKE -->

[eksctl-create]: https://eksctl.io/usage/creating-and-managing-clusters/
[eksctl-install]: https://eksctl.io/introduction/#installation
[eks]: https://aws.amazon.com/eks/

### Installing an Ingress controller

To provide an ingress in the cluster we are going to use the [`ingress-nginx`][ingress-nginx]:

```
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install nginx-ingress ingress-nginx/ingress-nginx
```

This will make sure that later when we deploy Backstage we have a way to access the frontend, backend and lighthouse
from the internet.

[ingress-nginx]: https://kubernetes.github.io/ingress-nginx/

### Installing backstage

We are going to use [Helm][helm] to deploy all the necessary Kubernetes components of Backstage.

If you use `brew` you can install it with the following command, or check other options [here][helm-install]

```bash
brew install helm
```

We are ready now to install Backstage. Let's say we have a domain called `mydomain.com` and we want to deploy Backstage
in a subdomain called `backstage.mydomain.com`. We will now fetch the Helm charts, apply our configuration and deploy
them to our cluster.

Clone the repository:

```
git clone https://github.com/backstage/backstage.git
cd contrib/chart/backstage
```
For the configuration we can create a `yaml` file for simplicity. In this example we will call it 
`backstage-values.yaml`. Remember to replace the email address with your own. It's important that this is a valid email
address.

<pre>
appConfig:
  app:
    baseUrl: https://backstage.mydomain.com
    title: Backstage
  backend:
    baseUrl: https://backstage.mydomain.com
    cors:
      origin: https://backstage.mydomain.com
  lighthouse:
    baseUrl: https://backstage.mydomain.com/lighthouse-api
  techdocs:
    storageUrl: https://backstage.mydomain.com/api/techdocs/static/docs
    requestUrl: https://backstage.mydomain.com/api/techdocs
issuer:
  email: <b>me@mydomain.com</b>
  clusterIssuer: "letsencrypt-prod"
</pre>

Now pick a name for the helm release, like `backstage-demo`, and run the `helm install` command:

```bash
helm dependency update
helm install -f backstage-values.yaml backstage-demo .
```

Now we can watch how all the pods start up:

```
$ kubectl get pods --watch
NAME                                         READY   STATUS    RESTARTS   AGE
backstage-demo-backend-ffb7f7b4-cq8pz        1/1     Running   0          95s
backstage-demo-frontend-d7cc8bfc7-pml6d      1/1     Running   0          95s
backstage-demo-lighthouse-78cb585d84-cmbk7   1/1     Running   0          95s
backstage-demo-postgresql-0                  1/1     Running   0          95s
```

[helm]: https://helm.sh
[helm-install]: https://helm.sh/#Homebrew

### Set up the DNS name

The last piece of work is to go to your DNS provider and configure the subdomain you picked earlier 
(`backstage.mydomain.com` in this example) to point to the backstage ingress. Find the address with:

```bash
kubectl get ingress
kube get ingress
NAME                                HOSTS                      ADDRESS                                                                  PORTS     AGE
backstage-demo-ingress              martina-demo.upstage.dev   abf809b4b70e545d59b77afc04a48d20-222006252.eu-west-1.elb.amazonaws.com   80, 443   2m44s
backstage-demo-ingress-lighthouse   martina-demo.upstage.dev   abf809b4b70e545d59b77afc04a48d20-222006252.eu-west-1.elb.amazonaws.com   80, 443   2m44s
```

Now we can go to our DNS provider and create a `cname` entry that points `backstage.mycompany.com` to our ingress
address, in this case `abf809b4b70e545d59b77afc04a48d20-222006252.eu-west-1.elb.amazonaws.com`.



