# qa-chat-app

## nginx configuration

### Include the conf.d directory

````http {
include       mime.types;  # Make sure this line is included
default_type  application/octet-stream;
    include C:/nginx-1.26.2/conf/conf.d/*.conf;  # Include all .conf files in conf.d
}```

```server {
    listen 5173;
    server_name localhost;  # You can replace this with localhost or your domain

    location / {
        root C:/nginx-1.26.2/html/dist;  # Path to your web app (adjust this if needed)
        try_files $uri $uri/ /index.html;  # Handle single-page application routing

		proxy_intercept_errors on;
               # Custom error page configuration

    }

    location /pdfs/ {
        alias C:/nginx-1.26.2/html/pdfs/;  # Folder for PDFs
    }
}```

add the pdf file inside the `/nginx/html/pdfs/`
## Project Setup

```sh
npm install
````

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```
