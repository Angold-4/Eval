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


/**
 * Binary operations
 */
#define BINARY_OP(op)	             \
	auto op2 = AS_NUMBER(pop()); \
	auto op1 = AS_NUMBER(pop()); \
	push(NUMBER(op1 op op2));    \

/* Backslash in C++ https://stackoverflow.com/questions/19405196/what-does-a-backslash-in-c-mean
 * As a line continuation
 * Since the preprocessor processed a #define until a newline is reached, 
 * line continuations are most useful in macro definitions. 
 */

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

	    constants.push_back(ALLOC_STRING("Hello"));
	    constants.push_back(ALLOC_STRING(" World!"));

	    code = {OP_CONST, 0, OP_CONST, 1, OP_ADD, OP_HALT};

	    // Set instruction pointer to the begining
	    ip = &code[0];

	    // Set instruction pointer to the begining
	    sp = &stack[0];
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

		    case OP_CONST: {
			push(GET_CONST());
			break;
		   }

		    case OP_ADD: {
			auto op2 = pop();
			auto op1 = pop();

			// Numeric addition:
			if (IS_NUMBER(op1) && IS_NUMBER(op2)) {
			    auto v1 = AS_NUMBER(op1);
			    auto v2 = AS_NUMBER(op2);
			    push(NUMBER(v1 + v2));
			}

			// String concatenation
			else if (IS_STRING(op1) && IS_STRING(op2)) {
			    auto s1 = AS_CPPSTRING(op1);
			    auto s2 = AS_CPPSTRING(op2);
			    push(ALLOC_STRING(s1 + s2));  // object
			}

			break;
		    }

		    case OP_SUB: {
			BINARY_OP(-);
			break;
		    }

		    case OP_MUL: {
			BINARY_OP(*);
			break;
		    }

		    case OP_DIV: {
			BINARY_OP(/);
			break;
		    }



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
