/**
 * Eva value
 */

#ifndef EvaValue_h
#define EvaValue_h

/**
 * Eva value type
 */
enum class EvaValueType {
    NUMBER,
};

/**
 * Eva value (tagged union)
 */
struct EvaValue {
    EvaValueType type;
    union {
	double number;
    };
};


#define NUMBER(value) ((EvaValue){EvaValueType::NUMBER, .number = value})

// ------------------------------------------------------------------------
// Accessors:

#define AS_NUMBER(evaValue) ((double)(evaValue).number)
#endif
