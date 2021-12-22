#include <iostream>

#include "src/vm/EvaVM.h"
#include "src/vm/EvaValue.h"
#include "src/Logger.h"

/**
 * Eva VM main executable
 */

int main(int argc, char const *argv[]) {
    EvaVM vm;

    // R means raw string
    // https://stackoverflow.com/questions/56710024/what-is-a-raw-string
    auto result = vm.exec(R"(
	3
    )");

    log(AS_NUMBER(result));

    std::cout << "All done!" << std::endl;

    return 0;
}
