#include <iostream>

#include "src/vm/EvaVM.h"
#include "src/vm/EvaValue.h"
#include "src/Logger.h"

/**
 * Eva VM main executable
 */

int main(int argc, char const *argv[]) {
    EvaVM vm;

    auto result = vm.exec(R"(
    )");

    log(AS_CPPSTRING(result));

    std::cout << "All done!" << std::endl;

    return 0;
}
