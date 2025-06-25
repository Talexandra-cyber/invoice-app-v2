import sympy as sp

# Define the variable
x = sp.Symbol('x', positive=True)

# Define the expression
expr = sp.sqrt((sp.sqrt(x) + 1/sp.sqrt(x)) / (sp.sqrt(x) - 1/sp.sqrt(x)))

# Compute the derivative
derivative = sp.diff(expr, x)

# Simplify the result
simplified_derivative = sp.simplify(derivative)

# Display results
print("Original expression:")
sp.pprint(expr)

print("\nDerivative:")
sp.pprint(derivative)

print("\nSimplified Derivative:")
sp.pprint(simplified_derivative) 