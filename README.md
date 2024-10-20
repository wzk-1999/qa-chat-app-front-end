# qa-chat-app

## nginx configuration

### Include the conf.d directory

http {
include mime.types;

default_type application/octet-stream;

include C:/nginx-1.26.2/conf/conf.d/\*.conf;
}

server {
listen 5173;
server_name localhost;

    location / {
        root C:/nginx-1.26.2/html/dist;
        try_files $uri $uri/ /index.html;

    	proxy_intercept_errors on;

    }

    location /pdfs/ {
        alias C:/nginx-1.26.2/html/pdfs/;
    }

}

add the pdf file inside the `/nginx/html/pdfs/`

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```
