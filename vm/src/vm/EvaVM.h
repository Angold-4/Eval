/**
 * Eva Virtual Machine
 */

#ifndef EvaVM_h
#define EvaVM_h

#include <string>
#include <vector>
#include <array>

#include "EvaValue.h"
#include "../Logger.h"
#include "../bytecode/OpCode.h"

#define READ_BYTE() *ip++

/**
 * Gets a constant from the pool
 */
#define GET_CONST() constants[READ_BYTE()]

/**
 * Stack top (stack overflow after exceeding)
 */
#define STACK_LIMIT 512



class EvaVM {
    public:
	EvaVM() {}


	/**
	 * Pushes a value onto the stack
	 */
	void push(const EvaValue& value) {
	    if ((sp - stack.begin()) == STACK_LIMIT) {
		DIE << "push(): Stack overflow.\n";
	    }
	    *sp = value;
	    sp++;
	}

	/**
	 * Pops a value onto the stack
	 */
	EvaValue pop() {
	    if (sp == stack.begin()) {
		DIE << "pop(): empty stack. \n";
	    }
	    --sp;
	    return *sp;
	}

	/**
	 * Executes a program
	 */
	EvaValue exec(const std::string &program) {
	    // 1. Parse the program

	    // 2. Compile program to Eva bytecode

	    constants.push_back(NUMBER(42));
	    code = {OP_CONST, 0, OP_HALT};
	    // Set instruction pointer to the begining
	    ip = &code[0];
	    return eval();
	}

	/** 
	 * Main eval loop
	 */
	EvaValue eval() {
	    for (;;) {
		auto opcode = READ_BYTE();
		switch (opcode) {
		    case OP_HALT:
			return pop();

		    case OP_CONST:
			push(GET_CONST());
			break;

		    default:
			DIE << "Unknown opcode: " << std::hex << opcode;
		}
	    }
	}


	/**
	 * Instruction pointer
	 */
	uint8_t* ip;


	/**
	 * Stack pointer
	 */
	EvaValue* sp;


	/**
	 * Operands stack
	 */
	std::array<EvaValue, STACK_LIMIT> stack;



	/**
	 * Constant pool
	 */
	std::vector<EvaValue> constants;
	

	/**
	 * Bytecode.
	 */
	std::vector<uint8_t> code;
};

#endif // evavm
