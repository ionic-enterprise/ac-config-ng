const { writeFile } = require("fs");

const targetPath = "src/config.ts";

const configFileContent = `export const config = {
  authUrlScheme: '${process.env.AUTH_URL_SCHEME}',
};
`;

writeFile(targetPath, configFileContent, function (err) {
  if (err) {
    console.log(err);
  }

  console.log(`Wrote variables to ${targetPath}`);
});
