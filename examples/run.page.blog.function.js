(async ({ pathMatches }) => {
    const template = `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <title>ODB | Testing Pages</title>
                <meta
                    content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1"
                    name="viewport"
                />
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,300italic,700,700italic">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.css">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/milligram/1.4.1/milligram.css">
                <style>
                  main {
                    margin: 64px auto;
                    max-width: 768px;
                    padding: 0 32px;
                    width: 100%;
                  }
                </style>
            </head>
            <body>
                <main>
                __CONTENT__
                </main>
                <!--script defer src="__SCRIPT__"></script-->
            </body>
        </html>
        `;

    const content = await sql(
        `SELECT html FROM blog_html WHERE post_id=(SELECT id FROM blog_post WHERE slug='${pathMatches.slug}')`
    );

    return template
        .replace('__CONTENT__', JSON.parse(content)[0].html)
        .replace(/<!--(.*?)-->|\B\n/gm, '')
        .replace(/>\s*</gm, '><');
})();
