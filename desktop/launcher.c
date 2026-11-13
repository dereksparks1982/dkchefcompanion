#define _POSIX_C_SOURCE 200809L
#include <errno.h>
#include <limits.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

/* Native Linux launcher shipped beside the bundled Electron executable.
   No installer, desktop integration or Terminal command is required. */
int main(int argc, char **argv) {
    char current[PATH_MAX];
    ssize_t count = readlink("/proc/self/exe", current, sizeof(current) - 1);
    if (count < 0 || count >= (ssize_t)sizeof(current) - 1) {
        perror("DK Chef Companion: locate executable");
        return 1;
    }
    current[count] = '\0';
    char *separator = strrchr(current, '/');
    if (!separator) {
        fputs("DK Chef Companion: invalid executable location\n", stderr);
        return 1;
    }
    *separator = '\0';
    char program[PATH_MAX];
    const char suffix[] = "/dk-chef-companion";
    if (strlen(current) + sizeof(suffix) > sizeof(program)) {
        fputs("DK Chef Companion: executable path too long\n", stderr);
        return 1;
    }
    snprintf(program, sizeof(program), "%s%s", current, suffix);
    char **arguments = calloc((size_t)argc + 2, sizeof(*arguments));
    if (!arguments) {
        perror("DK Chef Companion: out of memory");
        return 1;
    }
    arguments[0] = program;
    arguments[1] = "--no-sandbox"; /* Portable execution without a setuid sandbox installation. */
    for (int index = 1; index < argc; index++) arguments[index + 1] = argv[index];
    arguments[argc + 1] = NULL;
    execv(program, arguments);
    int error = errno;
    fprintf(stderr, "DK Chef Companion: unable to launch the bundled program: %s\n", strerror(error));
    free(arguments);
    return 1;
}
