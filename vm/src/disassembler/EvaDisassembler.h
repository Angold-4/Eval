/**
 * Eva disassembler
 */

#ifndef EvaDisassembler_h
#define EvaDisassembler_h

#include "../vm/EvaValue.h"
#include "../bytecode/OpCode.h"
#include <iomanip>
#include <array>

/**
 * Eva disassembler
 */
class EvaDisassembler {
public:
    /**
     * Disassembles a code unit
     */
    void disassemble(CodeObject* co) {
	std::cout << "\n------------------- Disassembly: "  << co->name
		  << " -------------------\n\n";

	size_t offset = 0;
	while (offset < co->code.size()) {
	    offset = disassembleInstruction(co, offset);
	    std::cout << "\n";
	}
    }

private:
    /**
     * Disassembles individual instruction
     */
    size_t disassembleInstruction(CodeObject* co, size_t offset) {
	std::ios_base::fmtflags f(std::cout.flags());

	// Print bytecode offset:
	std::cout << std::uppercase << std::hex << std::setfill('0') << std::setw(4)
	          << offset << "       ";

	auto opcode = co->code[offset];

	switch (opcode) {
	    case OP_HALT:
		return disassembleSimple(co, opcode, offset);
	    case OP_ADD:
	    case OP_SUB:
	    case OP_MUL:
	    case OP_DIV:
		return disassembleSimple(co, opcode, offset);

	    case OP_CONST:
		return disassembleConst(co, opcode, offset);

	    case OP_COMPARE:
		return disassembleCompare(co, opcode, offset);

	    case OP_JMP_IF_FALSE:
	    case OP_JMP:
		return disassembleJump(co, opcode, offset);
	    default:
		DIE << "disassembleInstruction: no disassembly for "
		    << opcodeToString(opcode);
	}

	std::cout.flags(f);
	return 0;
    }

    size_t disassembleSimple(CodeObject* co, uint8_t opcode, size_t offset) {
	dumpBytes(co, offset, 1);
	printOpCode(opcode);
	return offset + 1;
    }

    /**
     * Disassembles const instruction: OP_CONST <index>
     */
    size_t disassembleConst(CodeObject* co, uint8_t opcode, size_t offset) {
	dumpBytes(co, offset, 2);
	printOpCode(opcode);
	auto constIndex = co->code[offset + 1];
	std::cout << (int) constIndex << " (" 
		  << evaValueToConstantString(co->constants[constIndex]) << ")";
	return offset + 2;
    }

    /**
     * Disassembles compare instruction
     */
    size_t disassembleCompare(CodeObject* co, uint8_t opcode, size_t offset) {
	dumpBytes(co, offset, 2);
	printOpCode(opcode);
	auto compareOp = co->code[offset + 1];
	std::cout << (int) compareOp << " (" ;
	std::cout << inverseCompareOps_[compareOp] << ")";
	return offset + 2;
    }

    /**
     * Disassembles for jump
     */
    size_t disassembleJump(CodeObject* co, uint8_t opcode, size_t offset) {
	std::ios_base:: fmtflags f(std::cout.flags());

	dumpBytes(co, offset, 3);
	printOpCode(opcode);
	uint16_t address = readWordAtOffset(co, offset + 1);

	std::cout << std::uppercase << std::hex << std::setfill('0') << std::setw(4)
		  << (int) address << " ";

	std::cout.flags(f);
	return offset + 3;
    }

    /**
     * Reads a word at offset
     */
    uint16_t readWordAtOffset(CodeObject* co, size_t offset) {
	return (uint16_t) ((co->code[offset] << 8) | co->code[offset + 1]);
    }

    static std::array<std::string, 6> inverseCompareOps_;

    /**
     * Dumps raw memory from the bytecode
     */
    void dumpBytes(CodeObject* co, size_t offset, size_t count) {
	std::ios_base:: fmtflags f(std::cout.flags());
	std::stringstream ss;

	for (auto i = 0; i < count; i++) {
	    ss << std::uppercase << std::hex << std::setfill('0') << std::setw(2)
	       << (((int)co->code[offset + i]) & 0xFF) << " ";
	}

	std::cout << std::left << std::setfill(' ') << std::setw(12) << ss.str();
	std::cout.flags(f);
    }

    /**
     * Prints opcode
     */
    void printOpCode(uint8_t opcode) {
	std::ios_base::fmtflags f(std::cout.flags());
	std::cout << std::left << std::setfill(' ') << std::setw(20)
	          << opcodeToString(opcode) << " ";
	std::cout.flags(f);
    }

};

std::array<std::string, 6> EvaDisassembler::inverseCompareOps_ = {
    "<", ">", "==", "<=", "!=",
};

#endif
