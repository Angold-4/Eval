/**
 * Eva Virtual Machine
 */

#ifndef __EvaVM_h
#define __EvaVM_h

#include <string>
#include <vector>

#include "../bytecode/OpCode.h"

#define READ_BYTE() *ip++

class EvaVM {
    public:
	EvaVM() {}

	/**
	 * Executes a program
	 */

	void exec(const std::string &program) {
	    // 1. Parse the program

	    // 2. Compile program to Eva bytecode

	    code = {OP_HALT};
	    // Set instruction pointer to the begining
	    ip = &code[0];
	    return eval();
	}

	/** 
	 * Main eval loop
	 */
	void eval() {
	    for (;;) {
		switch (READ_BYTE()) {
		    case OP_HALT:
			return;
		}
	    }
	}


	/**
	 * Instruction pointer
	 */
	uint8_t* ip;

	/**
	 * Bytecode.
	 */
	std::vector<uint8_t> code;



};

#endif // evavm
