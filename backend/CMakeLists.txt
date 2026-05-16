cmake_minimum_required(VERSION 3.15)
project(VectorForge CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Optimize for speed
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O2")

add_executable(db src/main.cpp)

# Link Windows Socket Library if on Windows
if(WIN32)
    target_link_libraries(db ws2_32)
endif()
