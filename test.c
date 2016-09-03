
#include <stdio.h>
#include <stdlib.h>
#include <openssl/md4.h>

void main(void)
{
  //int status = 0;
  //MD4_CTX *c;
  unsigned char *data;
  unsigned char *digest;

  printf("This is a test.\n");

  //if(MD4_Init(c) == 0) {
  //  printf("MD4_Init failed.\n");
  //  goto out;
  //}

  if((data = malloc(64)) == NULL) {
    printf("Malloc failed.\n");
    goto out;
  }

  data = "I am a little teapot.";

  printf("data is %d bytes long\n", sizeof(data));

  MD4(data, sizeof(data), digest);

  printf("data='%s' digest='%s'", data, digest);

out:
  free(digest);
  free(data);
}
