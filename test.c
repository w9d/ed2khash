
#include <stdio.h>
#include <stdlib.h>
#include <bsd/bsd.h>
#include <openssl/md4.h>

int main(void)
{
  //int status = 0;
  //MD4_CTX *c;
  char *data = malloc(64);
  unsigned char *digest = malloc(1024);

  printf("This is a test.\n");

  //if(MD4_Init(c) == 0) {
  //  printf("MD4_Init failed.\n");
  //  goto out;
  //}

  if (data == 0 || digest == 0) {
    printf("Not initialised.\n");
    goto out;
  }

  //*data = *digest = "";

  strlcpy(data, "This is a test.", 16);

  //*data = "This is a test.";

  printf("data is %lu bytes long\n", strlen(data));
  printf("data='%s' digest='%s'\n", data, digest);

  MD4((unsigned char *)data, sizeof(data), digest);

  printf("data='%s' digest='%s'\n", data, digest);

out:
  free(digest);
  free(data);

  return 0;
}
