# QND-FS

A quick and dirty file server for personal projects, feel free to host this yourself or whatever but I can't guarantee anything.

## How to use
How to start:
- `bun start`
- Profit.

`0.0.0.0` will be used as a stand-in for the hostname of your server.

How to generate tokens:
- run `bun token`, enter the project name, and it will send back a token, this is stored on the server using your app key, don't share this. Store your token safely in your own app.
- Use said token for file upload.

How to use:
- Send a request to 0.0.0.0/url with the following parameters, `token`, `project_name`
- The server will give you back a url to upload the file, it will be valid for a configurable amount of time in `.env`
- Upload your file to the url, after the file is uploaded once, or the upload fails, the url will be invalid and you will have to try again.