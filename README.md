## How to generate the keys

Generate private key command:

`openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2848`

Generate publid key command:

`openssl rsa -pubout -in private_key.pem -out public_key.pem`

Convert them to base64 and put the converted values in the .env

`base64 -w 0 private_key.pem`  
`base64 -w 0 public_key.pem`

The .pem files can be deleted afterward.
