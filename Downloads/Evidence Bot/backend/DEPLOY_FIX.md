# Fix for "no main manifest attribute" Error

## Problem
The JAR file was built without the Main-Class manifest attribute, making it non-executable.

## Solution Applied
Updated `pom.xml` to properly configure the `spring-boot-maven-plugin` with:
- Explicit `repackage` goal execution
- Proper configuration to create executable JAR

## Next Steps

1. **Commit the fix:**
   ```bash
   git add backend/pom.xml
   git commit -m "Fix Spring Boot Maven plugin configuration for executable JAR"
   git push
   ```

2. **Render will automatically rebuild** when you push

3. **Monitor the deployment** in Render dashboard

The build should now create an executable JAR with the Main-Class attribute properly set.

