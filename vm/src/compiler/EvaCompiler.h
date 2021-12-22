/**
 * Eva Compiler
 */

#ifndef EvaCompiler_h
#define EvaCompiler_h

#include "../bytecode/OpCode.h"
#include "../vm/EvaValue.h"
#include "../Logger.h"
#include "../parser/EvaParser.h"

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
		DIE << "Exptype::SYMBOL: unimplemented.";
		break;

	    /**
	     * Symbols (variables, operations)
	     */
	    case ExpType::LIST:
		DIE << "Exptype::LIST: unimplemented.";
		break;
	}
    }

private:

    CodeObject* co;
    /**
     * Allocates a numeric constant (index).
     */
    size_t numericConstIdx(double value) {
	for (auto i = 0; i < co->constants.size(); i++) {
	    if (!IS_NUMBER(co->constants[i])) {
		continue;
	    }
	    if (AS_NUMBER(co->constants[i]) == value) {
		// reuse
		return i;
	    }
	}
	co->constants.push_back(NUMBER(value));
	return co->constants.size() - 1;
    }

    /**
     * Allocates a string constant (index).
     */
    size_t stringConstIdx(const std::string& value) {
	for (auto i = 0; i < co->constants.size(); i++) {
	    if (!IS_STRING(co->constants[i])) {
		continue;
	    }
	    if (AS_CPPSTRING(co->constants[i]) == value) {
		// reuse
		return i;
	    }
	}
	co->constants.push_back(ALLOC_STRING(value));
	return co->constants.size() - 1;
    }




    void emit(uint8_t code) {
	co->code.push_back(code);
    }


};

#endif
