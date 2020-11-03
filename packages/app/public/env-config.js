window._appConfig_ = {
  app: {
    title: "Martinaaaa backstage",
    baseUrl: window.location.hostname
  },
  backend: {
    // For local development
    baseUrl: "http://localhost:7000"
    // For k8s 
    //baseUrl: ""
  }
}


// Now we need to decide what gets sent from the backend. Today the config for the backend, the frontend and the plugins lives together in the same file, app-config.yaml and each part of the whole system can access any part of this config. In fact, we cannot know which fields are accessed by the frontend (unless we go and read all the code). (This could be solved if what Patrick proposed in this RFC is implemented). And we don't want to send the whole configuration from the backend as it is because that might contain secrets (like API keys) that should not be leaked.
