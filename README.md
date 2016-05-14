# Webotest

**Webotest** is an npm package - automated web test, used to compare two website page screenshots - local (unpublished) un public (published). `Focusing on multipage CMS websites (for example `[EPiServer CMS](http://world.episerver.com/cms/)`, where CMS pages are part of website's navigation`.

[**Webotest** repository available on GitHub](https://github.com/elinale/webotest) and [**Webotest** package available on npm](https://www.npmjs.com/package/webotest).


### Prerequisites

You need to have [installed npm and Node.js](https://docs.npmjs.com/getting-started/installing-node) on your machine.

Website navigation structure has to be identical to run successful test - otherwise there is no use to run tests, as they won't bring up the necessary and proper results.

Only publicly available pages will be read in website navigation to create comparement.

`!` Using hyperlink `<a></a>` href data to get hierachical structure of website.


### Installing

```
npm install webotest
```


### Running the tests

Run tests in console from **webotest** directory, for example: `C:\Users\elinale\node_modules\webotest` ... `This directory also is, where all test results are saved`.

There is only one command to run **webotest**:

```
node web-tester.js --localUrl=http://local_website --publicUrl=http://public_website
```

as in

```
node web-tester.js --localUrl=http://site.localtest.me --publicUrl=http://www.site.com

node web-tester.js --localUrl=http://site.localtest.me --publicUrl=http://test.site.com

node web-tester.js --localUrl=http://site.localtest.me --publicUrl=http://staging.site.com

etc.
```

`!` Always write down the protocol as shown in example, otherwise tests won't be run.

`!` Remember to keep in sync content between local and public websites and identical navigation structure (links), as **webotest** relies on that. Again, great to work with websites created on [EPiServer CMS](http://world.episerver.com/cms/) basis, as it allows to import/export website contents.

### Why to test?

To prevent unwanted changes in website design, ease job with bug reports - just check **localhost:8082** after you get notification "Listening to localhost" in console.

`!` Note, that html files can be overviewed in browser while local server is running, as they are created dynamically and get data from server side.


### What files will you get after test has done?

Main directory (created based on test date) with four subdirectories:
* for local site;
* for published site;
* dynamically created html files (for local server);
* image results (.png files).

Local site and public site subdirectories contain:
* image directory with site's hierarchical page structure screenshots;
* .json file with a list of site's hierarchical structure (URL addresses).


### Author

`Elina Lenova`


### License

This project is licensed under the MIT License.


### Acknowledgments

Other npm packages also were used, to make things happen, check the `package.json` file to see the list of dependencies and under `other_resources` directory.
