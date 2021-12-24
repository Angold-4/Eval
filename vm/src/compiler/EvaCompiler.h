/**
 * Eva Compiler
 */

#ifndef EvaCompiler_h
#define EvaCompiler_h

#include <map>
#include <string>

#include "../bytecode/OpCode.h"
#include "../vm/EvaValue.h"
#include "../Logger.h"
#include "../parser/EvaParser.h"


// Allocates new constant in the pool.
#define ALLOC_CONST(tester, converter, allocator, value) \
    do {                                                 \
    for (auto i = 0; i < co->constants.size(); i++) {    \
	if (!tester(co->constants[i])) {                 \
	    continue;                                    \
	}                                                \
	if (converter(co->constants[i]) == value) {      \
	    return i;                                    \
	}                                                \
    }                                                    \
    co->constants.push_back(allocator(value));           \
    } while (false)                                      \

//  Generic binary operator: 
#define GEN_BINARY_OP(op) \
    do {              \
    gen(exp.list[1]); \
    gen(exp.list[2]); \
    emit(op);         \
    } while (false)   \


/**
 * Compiler class, emits bytecode, records constant pool, vars, etc.
 */
class EvaCompiler {
public:
    EvaCompiler() {}

    /**
     * Main compile API
     */
    CodeObject* compile(const Exp& exp) {
	// Allocate new code object:
	co = AS_CODE(ALLOC_CODE("main"));

	// Generate recursively from top-level
	gen(exp);

	// Explicit VM-stop marker
	emit(OP_HALT);

	return co;

    }

    /**
     * Main compile loop
     * Code generator (iteration)
     */
    void gen(const Exp& exp) {
	switch(exp.type) {
	    /**
	     * Numbers
	     */
	    case ExpType::NUMBER:
		emit(OP_CONST);
		emit(numericConstIdx(exp.number));
		break;

	    /**
	     * Strings
	     */
	    case ExpType::STRING:
		emit(OP_CONST);
		emit(stringConstIdx(exp.string));
		break;

	    /**
	     * Symbols (variables, operations)
	     */
	    case ExpType::SYMBOL:
		/*
		 * Boolean
		 */
		if (exp.string == "true" || exp.string == "false") {
		    emit(OP_CONST);
		    emit(booleanConstIdx(exp.string == "true" ? true : false));
		} else {
		    // Variables TODO

		}
		break;

	    /**
	     * Symbols (variables, operations)
	     */
	    case ExpType::LIST:
		auto tag = exp.list[0];

		if (tag.type == ExpType::SYMBOL) {
		    auto op = tag.string;

		    // --------------------------------------------
		    // Binary math operations
		    if (op == "+") {
			GEN_BINARY_OP(OP_ADD);
		    }
		    
		    else if (op == "-") {
			GEN_BINARY_OP(OP_SUB);
		    }

		    else if (op == "*") {
			GEN_BINARY_OP(OP_MUL);
		    }

		    else if (op == "/") {
			GEN_BINARY_OP(OP_DIV);
		    }

		    // --------------------------------------------
		    // Compare operations:

		    else if (compareOps_.count(op) != 0) {
			gen(exp.list[1]);
			gen(exp.list[2]);
			emit(OP_COMPARE);
			emit(compareOps_[op]);
		    }
		}
		break;
	}
    }

private:

    /**
     * Compiling code object
     */
    CodeObject* co;



    /**
     * Compare ops map
     */
    static std::map<std::string, uint8_t> compareOps_;


    /**
     * Allocates a numeric constant (index).
     */
    size_t numericConstIdx(double value) {
	ALLOC_CONST(IS_NUMBER, AS_NUMBER, NUMBER, value);
	return co->constants.size() - 1;
    }

    /**
     * Allocates a numeric constant (index).
     */
    size_t booleanConstIdx(bool value) {
	ALLOC_CONST(IS_BOOLEAN, AS_BOOLEAN, BOOLEAN, value);
	return co->constants.size() - 1;
    }
    /**
     * Allocates a string constant (index).
     */
    size_t stringConstIdx(const std::string& value) {
	ALLOC_CONST(IS_STRING, AS_CPPSTRING, ALLOC_STRING, value);
	return co->constants.size() - 1;
    }

    void emit(uint8_t code) {
	co->code.push_back(code);
    }

};

std::map <std::string, uint8_t> EvaCompiler::compareOps_ = {
    {"<", 0}, {">", 1}, {"==", 2}, {">=", 3}, {"<=", 4}, {"!=", 5},

};

#endif
