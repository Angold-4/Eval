# Virtual Machine
##### Jiawei Wang 2021-12-21

### 1. Stack-Based Virtual Machine

```java
public class JavaBytecode {
    public static void main(String[] args) {
	int x = 15;
	System.out.println(x + 10 - 5);
    }
}
```

```java
❯ javap -c JavaBytecode
Compiled from "JavaBytecode.java"
public class JavaBytecode {
  public JavaBytecode();
    Code:
       0: aload_0
       1: invokespecial #1                  // Method java/lang/Object."<init>":()V
       4: return

  public static void main(java.lang.String[]);
    Code:
       0: bipush        15
       2: istore_1
       3: getstatic     #7                  // Field java/lang/System.out:Ljava/io/PrintStream;
       6: iload_1
       7: bipush        10
       9: iadd
      10: iconst_5
      11: isub
      12: invokevirtual #13                 // Method java/io/PrintStream.println:(I)V
      15: return
}
```

