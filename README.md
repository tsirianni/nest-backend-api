## How to generate the keys

Generate private key command:

`openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2848`

Generate publid key command:

`openssl rsa -pubout -in private_key.pem -out public_key.pem`

Convert them to base64 and put the converted values in the .env

`base64 -w 0 private_key.pem`  
`base64 -w 0 public_key.pem`

The .pem files can be deleted afterward.

## How to generate cipher secret

Execute the following command on the terminal:

`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

This should print a 64 characters long hex string that can be used with for example a `aes-256-cbc` algorithm. Please note that you can change the algorithm through an environment variable, but mind the necessary changes to the key size (also a .env variable), IV size requirements and more.
