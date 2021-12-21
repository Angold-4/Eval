#include <iostream>

#include "src/vm/EvaVM.h"
#include "src/Logger.h"

/**
 * Eva VM main executable
 */

int main(int argc, char const *argv[]) {
    EvaVM vm;


    auto result = vm.exec(R"(
    )");

    log(result.number);

    std::cout << "All done!" << std::endl;

    return 0;
}
