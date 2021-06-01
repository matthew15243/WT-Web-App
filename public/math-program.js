let student_profile_data = {};
let student_math_program_profile_data = {};

// Set the math program data
let student_grade = 0;
let current_lesson_data = undefined;
let student_notes_data = {};
let note_flag = false;
let lesson_flag_counter = 0;
getLessons()

let session_date = new Date()
let css_colors = {'assigned' : 'yellow', 'needs help' : 'red', 'mastered' : 'green', 'not assigned' : 'blank'}
const program_links = ['https://www.khanacademy.org/math/cc-kindergarten-math',
                       'https://www.khanacademy.org/math/cc-1st-grade-math',
                       'https://www.khanacademy.org/math/cc-2nd-grade-math',
                       'https://www.khanacademy.org/math/cc-third-grade-math',
                       'https://www.khanacademy.org/math/cc-fourth-grade-math',
                       'https://www.khanacademy.org/math/cc-fifth-grade-math',
                       'https://www.khanacademy.org/math/cc-sixth-grade-math',
                       'https://www.khanacademy.org/math/cc-seventh-grade-math',
                       'https://www.khanacademy.org/math/cc-eighth-grade-math',
                       'https://www.khanacademy.org/math/algebra',
                       'https://www.khanacademy.org/math/geometry',
                       'https://www.khanacademy.org/math/algebra2',
                       'https://www.khanacademy.org/math/trigonometry',];

main();
function main() {
  retrieveInitialData()
  .then(() => {
    setStudentProfile();
    setStudentSTProfile();
    getNotes('log');
    allowExpectationChange();
  })
}
const gradeK = {'Count and Cardinality' : ['Know number names and the count sequence', 'Count to tell the number of objects', 'Compare numbers'],
                'Operation and Algebraic Thinking' : ['Understanding addition as putting together and adding to', 'Undertand subtraction as taking apart and taking from'],
                'Number and Operation in Base Ten' : ['Work with numbers 11-19 to gain foundations for place values'],
                'Measurement and Data' : ['Describe and compare measurable attributes', 'Classify objects and count the number of objects in ech category'],
                'Geometry' : ['Identify and describe chapes', 'Analyze, compare, create, and compose shapes']}

const grade1 = {'Place Value' : ['Numbers 0 to 120', 'Ones and tens', 'Comparing 2-digit numbers'],
                'Addition and Subtraction' : ['Relate addition and subtraction', 'Adding within 20', 'Subtraction within 20', 'Equal sign', 'Missing number within 20', 'Word problems within 20', "Word problems with 'more' and 'fewer'", "Adding 1's and 10's", 'Intro to addition with 2-digit numbers'],
                'Measurement, Data, and Geometry' : ['Length and size', 'Bar graphs', 'Time', 'Shapes', 'Fractions of shapes']}

const grade2 = {'Place Value' : ['Hundreds', 'Comparing 3-digit numbers'],
                'Addition and Subtraction within 100' : ['Repeated addition', 'Adding 1s and 10s', 'Subtracting 1s and 10s', 'Intro to addition with 2-digit numbers', 'Intro to subtraction with 2-digit numbers', 'Strategies for adding and subtracting within 100', 'Addition within 100', 'Subtraction within 100', 'Word problems within 100', 'Word problems with "more" and "fewer" (within 100)', 'Skip-counting', 'Addition and subtraction missing value problems'],
                'Addition and Subtraction within 1000' : ['Adding 1s, 10s and 100s', 'Subtracting 1s, 10s, and 100s', 'Strategies for adding 2- and 3-digit numbs'], 
                'Measurement, Data, and Geometry' : ['Measuring length', 'Comparing and estimating length', 'Length word problems', 'Picture graphs', 'Bar graphs', 'Line plots', 'Time', 'Money', 'Shapes', 'Fractions of shapes']}

const grade3 = {'Addition and Subtraction' : ['Strategies for adding 2- and 3-digit numbers', 'Adding with regrouping within 1000', 'Subtracting with regrouping within 1000', 'Addition and subtraction missing value problems'],
               'Multiplication and Division' : ['Multiplication intro', 'Multiplication facts', 'Relating multiplication and division', 'Division intro', 'Division facts', 'More with 1-digit multiplication and division', 'Properties of multiplication', 'One and two-step word problems', 'Multiplying by tens', 'Patterns in arithmetic'],
               'Fractions' : ['Fractions intro', 'What fractions mean', 'Fractions on the number line', 'Fractions and whole numbers', 'Equivalent fractions', 'Equivalent fractions on the number line', 'Comparing fractions', 'Comparing fractions of different wholes'],
               'Measurement and Data' : ['Time', 'Mass', 'Volume', 'Bar graphs', 'Picture graphs', 'Line plots'], 
               'Geometry' : ['Area intro', 'Count unit squares to find area', 'Area formula intuition', 'Multiply to find area', 'Area and the distributive property', 'Decompose figures to find area', 'Perimeter', 'Comparing area and perimeter', 'Perimeter word problems', 'Quadrilaterals'], 
               'Place Value and Rounding' : ['Rounding']}

const grade4 = {'Addition and Subtraction' : ['Adding multi-digit numbers', 'Subtracting multi-digit numbers'],
                'Multiplication and Division' : ['Multiplication by 10s, 100s, and 1000s', 'Multi-digit multiplication: place value and area models', 'Multi-digit mulitplication: standard algorithm', 'Comparing with multiplication', 'Division: problems that work out nicely', 'Division: place value and area', 'Multi-digit division', 'Remainders', 'Multiplication, division word problems'],
                'Fraction' : ['Equivalent fraction', 'Common denominators', 'Comparing fractions with unlike demonimators visually', 'Comparing fractions with unlike denominators', 'Decomposing fractions', 'Adding and subtracting fractions with like denominators', 'Adding and subtracting fractions: word problems', 'Mixed numbers', 'Adding and subtracting mixed numbers', 'Multiplying unit fractions and whole numbers', 'Multiplying whole numbers and fractions', 'Multiplying whole nunbers and fractions word problems', 'Fractions with denominators of 10 and 100'],
                'Decimals' : ['Intro to decimals', 'Decimals on the number line', 'Decimals vs. fractions', 'Decimals greater than one', 'Converting decimals to fractions', 'Common fractions and decimals', 'Comparing decimals visually', 'Comparing decimals'],
                'Measurement and Data' : ['Estimating mass', 'Estimating volume', 'Estimating length', 'Time', 'Converting units of mass', 'Converting units of volume', 'Converting units of length', 'Converting units of time', 'Money word problems', 'Conversion word problems', 'Area and perimeter', 'Line plots with fractions'],
                'Geometry' : ['Lines, line segments, and rays', 'Parallel and perpendicular', 'Angle introduction', 'Measuring angles', 'Constructing angles', 'Angles in circles', 'Angle types', 'Decomposing angles', 'Line of symmetry', 'Classifying triangles', 'Classifying geometric shapes'],
                'Factors, Multiples, and Patterns' : ['Factors and multiples', 'Prime and composite numbers', 'Math patterns'],
                'Place Value and Rounding' : ['Intro to place value', 'How 10 relates to place value', 'Ways to write whole numbers (expanded and written)', 'Regrouping whole numbers', 'Comparing multi-digit numbers', 'Rounding whole numbers']}

const grade5 = {'Addition and Subtraction' : ['Common fractions and decimals', 'Adding decimals intro', 'Adding decimals', 'Subtracting decimals intro', 'Subtracting decimals'],
                'Multiplication and Division' : ['Multi-digit multiplication', 'Multiplying decimals', 'Multi-digit division', 'Dividing decimals'],
                'Fractions' : ['Visually adding and subtracting fractions with unlike denominators', 'Common denominators', 'Adding and subtracting fractions with unlike denominators', 'Adding and subtracting mixed number with unlike denominators', 'Adding and subtracting fractions with unlike denominators word problems', 'Multiplication as scaling', 'Multiplying fractions and whole numbers', 'Multiplying fractions and whole numbers word problems', 'Multiplying fractions', 'Multiplying mixed numbers', 'Multiplying fractions word problems', 'fractions as division', 'Dividing unit fractions by whole numbers', 'Dividing whole numbers by unit fractions', 'Dividing fractions and whole numbers word problems'],
                'Place Value and Decimals' : ['Decimal place value intro', 'Decimals in expanded form', 'Decimals in written form', 'Comparing decimals', 'Rounding decimals', 'Multiplying and dividing whole numbers by 10, 100, and 1000', 'Multiplying and dividing decimals by 10, 100, and 1000', 'Powers of 10', 'Multiplying and dividing with powers of 10', 'Comparing decimal place values', 'Regrouping decimal numbers'],
                'Measurement and Data' : ['Volume intro', 'Finding volume', 'Unit conversion', 'Unit measurement word problems', 'Data'],
                'Geometry' : ['Intro to the coordinate plane', 'Coordinate plane word problems', 'Quadrilaterals'],
                'Algebraic Thinking' : ['Writing expressions', 'Number patterns']}

const grade6 = {'Ratios, Rates, and Percentages' : ['Intro to ratios','Equivalent ratios', 'Visualize ratios', 'Ratio application', 'Intro to rates', 'Intro to percents', 'Percent, decimal, fraction conversions', 'Percent problems', 'Percent word problems'],
                'Arithmetic Operations' : ['Adding decimals', 'Subtracting decimals', 'Adding and subtracting decimals word problems', 'Multiplying decimals', 'Dividing whole numbers', 'Dividing decimals', 'Dividing fractions by fractions', 'Exponents', 'Order of Operations'],
                'Negative Numbers' : ['Intro to negative numbers', 'Negative decimals and fractions on the number line', 'Number opposites', 'Comparing negative numbers', 'Negative symbol as opposite', 'Absolue value', 'Coordinate plane'],
                'Properties of Numbers' : ['Properties of numbers', 'Whole numbers and integers', 'Least common multiple', 'Greatest common factor'],
                'Variables and Expressions' : ['Parts of algebraic expressions', 'Substitution and evaluating expressions', 'Expression value intuition', 'Evaluating expressions word problems', 'Writing algebraic expressions introduction', 'Writing basic algebraic expressions word problems', 'Distributive property with variables', 'Combining like terms', 'Equivalent expressions'],
                'Equations and Inequalities Introduction' : ['Algebraic equations basics', 'One-step equations intuition', 'One-step addition and subtraction equations', 'One-step multiplication and division equations', 'Finding mistakes in one-step equations', 'One-step equation word problems', 'Intro to inequalities with variables', 'Dependent and independent variables'],
                'Geometry' : ['Areas of parallelograms', 'Areas of triangles', 'Area of composite figures', 'Geometric solids (3D shapes)', 'Volume with fractions', 'Surface area', 'Polygons on the coordinate plane'],
                'Data and Statistics' : ['Dot plots and frequency tables', 'Statistical questions', 'Histograms', 'Mean and median', 'Mean and median challenge problems', 'Interquartile range (IQR)', 'Box plots', 'Mean absolute deviation (MAD)', 'Comparing data displays', 'Shape of data distributions']}

const grade7 = {'Negative Numbers: Addition and Subtraction' : ['Intro to adding negative numbers', 'Intro to subtracting negative numbers', 'Adding and subtracting with negative numbers on the number line', 'Adding and subtracting integers', 'Adding and subtracting negative fractions', 'Addition and subtraction word problems with negatives', 'Absolute value', 'Properties of addition and subtraction', 'Adding and subtracting negative numbers: variables'],
                'Negative Numbers' : ['Multiply and divide negative numbers', 'Multiplication and division word problems with negatives', 'Understanding multiplying and dividing fractions', 'Multiply and divide negative fractions', 'Order of operations', 'Properties of multiplication and division'],
                'Fractions, Decimals, and Percentages' : ['Converting fractions to decimals', 'Adding and subtracting rational numbers', 'Percent word problems', 'Rational number word problems'],
                'Rates and Proportional Relationships' : ['Rate problems with fractions', 'Constant of proportionality', 'Compare and interpret constants of proportionality', 'Identifying proportional relationships', 'Graphs of proportional relationships', 'Writing and solving proportions', 'Equations of proportional relationships'],
                'Expressions, Equations, and Inequalities' : ['Combining like terms', 'The distributive property and equivalent expressions', 'Interpreting linear expressions', 'Two-step equations intro', 'Two-step equations with decimals and fractions', 'Two-step equation word problems', 'One-step inequalities', 'Two-step inequalities'],
                'Geometry' : ['Area and circumference of circles', 'Area and circumference challenge problems', 'Vertical, complementary, and supplementary angles', 'Missing angle problems', 'Constructing triangles', 'Slicing geometric shapes', 'Scale copies', 'Scale drawings', 'Volume and surface area word problems'],
                'Statistics and Probability' : ['Basic probability', 'Probability models', 'Compound events and sample spaces', 'Comparing and sampling populations']}

const grade8 = {'Numbers and Operations' : ['Repeating decimals', 'Square roots and cube roots', 'Irrational numbers', 'Approximating irrational numbers', 'Exponents with negative bases', 'Exponent properties intro', 'Negative exponents', 'Exponent properties (integer exponents)', 'Working with powers of 10', 'Scientific notation intro', 'Arithmetic with numbers in scientific notation', 'Scientific notation word problems'],
                'Solving Equations with one Unknown' : ['Equations with variables on both sides', 'Equations with parentheses', 'Number of solutions to equations', 'Equations word problems'],
                'Linear Equations and Functions' : ['Graphing proportional relationships', 'Solutions to linear equations', 'Intercepts', 'Slope', 'Intro to slope-intercept form', 'Graphing slope-intercept form', 'Writing slope-intercept equations', 'Functions', 'Linear models', 'Comparing linear functions', 'Constructing linear models for real-world relationships', 'Recognizing functions', 'Linear and nonlinear functions'],
                'Systems of Equations' : ['Intro to systems of equations', 'Systems of equations with graphing', 'solving systems with substitution', 'Number of solutions to systems of equations', 'Systems of equations word problems'],
                'Geometry' : ['Angles between intersecting lines', 'Triangle angles', 'Pythagorean theorem', 'Pythagorean theorem application', 'Pythagorean theorem and distance between points', 'Pythagorean theorem proofs', 'Volume'],
                'Geometric Transformations' : ['Transformations intro', 'Translations', 'Rotations', 'Reflections', 'Properties and definitions of transformations', 'Dilations', 'Congruence and similarity'],
                'Data and Modeling' : ['Introduction to scatter plots', 'Interpreting scatter plots', 'Estimating lines of best fit', 'Two-way tables']}

const grade9 = {'Algebra Foundations' : ['Overview and history of algebra', 'Introduction to variables', 'Substitutions and evaulating expressions', 'Combining like terms', 'Introduction to equivalent expressions', 'Division by zero'],
                'Solving Equations & Inequalities' : ['Linear equations with variables on both sides', 'Linear equations with parentheses', 'Analyzing the number of solutions to linear equations', 'Linear equations with unknown coefficients', 'Multi-step inequalities', 'Compound inequalities'],
                'Working with Units' : ['Rate conversion', 'Appropriate units', 'Word problems with multiple units'],
                'Linear Equations & Graphs' : ['Two-variable linear equations intro', 'Slope', 'Horizontal & vertical lines', 'x-intercepts and y-intercepts', 'Applying intercepts and slope'],
                'Forms of Linear Equations' : ['Intro to slope-intercept form', 'Graphing slope-intercept equations', 'Writing slope-intercept equations', 'Point-slope form', 'Standard form', 'Summary: Forms of two-variable linear equations'],
                'Systems of Equations' : ['Introduction to systems of equations', 'Solving systems of equations with substitution', 'Solving systems of equations with elimination', 'Equivalent sytems of equations', 'Number of solutions to systems of equations', 'Systems of equations word problems'],
                'Inequalities (systems & Graphs)' : ['Checking solutions of two-variable inequalities', 'Graphing two-variable inequalities', 'Modeling with linear inequalities'],
                'Functions' : ['Evaluating functions', 'Inputs and outputs of a function', 'Functions and equations', 'Interpretting function notation', 'Introduction to the domain and range of a function', 'Determining the domain of a function', 'Recognizing functions', 'Maximum and minimum points', 'Intervals where a function is positive, negative, or decreasing', 'Interpretting features of graphs', 'Average rate of change', 'Average rate of change word problems', 'Intro to inverse functions'],
                'Sequences' : ['Introduction to arithmetic sequences', 'Constructing arithmetic sequences', 'Introduction to geometric sequences', 'Constructing geometric sequences', 'Modeling with sequences', 'General sequences'],
                'Absolute Value & Piecewise Functions' : ['Graphs of absolute value functions', 'Piecewise functions'],
                'Exponents & Radicals' : ['Exponent properties review', 'Radicals', 'Simplifying square roots'],
                'Exponential Growth and Decay' : ['Exponential vs. linear growth', 'Exponential expressions', 'Graphs of exponential growth', 'Exponential vs. linear growth over time', 'Exponential growth and decay', 'Exponential functions from tables and graphs', 'Exponential vs. linear models'],
                'Quadratics: Multiplying and Factoring' : ['Multiplying monomials by polynomials', 'Multiplying binomials', 'Special products of binomials', 'Introduction to factoring', 'Factoring quadratics intro', 'Factoring quadratics by grouping', 'Factoring quadratics with difference of squares', 'Factoring quadratics with perfect squares', 'Strategy in factoring quadratics'],
                'Quadratic Functions & Equations' : ['Intro to parabolas', 'Solving and graphing with factored form', 'Solving by taking the square root', 'Vertex form', 'Solving quadratics by factoring', 'The quadratic formula', 'Completing the square intro', 'More on completing the square', 'Strategizing to solve quadratic equations', 'Quadratic standard form', 'Features & forms of quadratics functions', 'Comparing quadratic functions', 'Transforming quadratic functions'],
                'Irrational Numbers' : ['Irrational numbers', 'Sums and products of rational and irrational numbers', 'Proofs concerning irrational numbers']};

const grade10 = {'Performing Transformations' : ['Intro to Euclidean geometry', 'Introduction to rigid transformations', 'Translations', 'Rotations', 'Reflections', 'Dilations'],
                 'Transformation Properties and Proofs' : ['Rigid transformations overview', 'Dilation preserved properties', 'Properties and definitions of transformations', 'Symmetry', 'Proofs with transformations'],
                 'Congruence' : ['Transformations & congruence', 'Triangle congruence from transformations', 'Congruent triangles', 'Theorems concerning triangle properties', 'Working with triangles', 'Theorems concerning quadrilateral properties', 'Proofs of general theorems', 'Constructing lines and angles'],
                 'Similarity' : ['Definitions of similarity', 'Introduction to triangle similarity', 'Solving similar triangles', 'Angle bisector theorem', 'Solving problems with similar and congruent trianges', 'Proving relationships using similarity', 'Solving modeling problems with similar and congruent triangles'],
                 'Right Triangles and Trigonometry' : ['Pythagorean theorem', 'Pythagorean theorem proofs', 'Special right triangles', 'Ratios in right triangles', 'Introduction to the trigonometric ratios', 'Solving for a side in a right triangle using the ratios', 'Solving for an angle in a right triangle using the ratios', 'Sine and Cosine of complementary angles', 'Modeling with right triangles'],
                 'Non-right Triangles & Trigonometry (Advanced)' : ['Law of sines', 'Law of cosines', 'Solving general triangles'],
                 'Analytic geometry' : ['Distance and midpoints', 'Dividing line segments', 'Problem solving with distance on the coordinate plane', 'Parallel and perpendicular lines on the coordinate plane', 'Equations of parallel and perpendicular lines'],
                 'Conic Sections' : ['Graphs of circles intro', 'Standard equation of a circle', 'Expanded equation of a circle', 'Focus and directrix of a parabola'],
                 'Circles' : ['Circle basics', 'Arc measure', 'Arc length (from degrees)', 'Introduction to radians', 'Arc length (from radians)', 'Sectors', 'Inscribed angles', 'Inscribed shapes problem solving', 'Proofs with inscribed shapes', 'Properties of tangents', 'Constructing regular polygons inscribed in circles', 'Constructing circumcircles and incircles', 'Constructing a line tangent to a circle'],
                 'Solid Geometry' : ['2D vs 3D objects', "Cavalieri's principle and dissection methods", 'Volume and surface area', 'Density']};

const grade11 = {'Polynomial Arithmetic' : ['Intro to polynomials', 'Average rate of change of polynomials', 'Adding and subtracting polynomials', 'Multiplying monomials by polynomials', 'Multiplying binomials by polynomials', 'Special products of polynomials'],
                 'Complex Numbers' : ['The imaginary unit i', 'Complex numbers introduction', 'The complex plane', 'Adding and subtracting complex numbers', 'Multiplying complex numbers', 'Quadratic equations with complex solutions'],
                 'Polynomial Factorization' : ['Factoring monomials', 'Greatest common factor', 'Taking common factors', 'Factoring higher degree polynomials', 'Factoring using structure', 'Polynomial identities', 'Geometric series'],
                 'Polynomial Division' : ['Dividing polynomials by x', 'Dividing quadratics by linear factors', 'Dividing polynomials by linear factors', 'Polynomial Remainder Theorem'],
                 'Polynomial Graphs' : ['Zeroes of polynomials', 'Positive and negative intervals of polynomials', 'End behavior of polynomials', 'Putting it all together'],
                 'Rational Exponents and Radicals' : ['Rational exponents', 'Properties of exponents (rational exponents)', 'Evaluating exponents and radicals', 'Equivalent forms of exponential expressions', 'Solving exponential equations using properties of exponents'],
                 'Exponential Models' : ['Interpretting the rate of change exponential models', 'Constructing exponential models according to rate of change', 'Advanced interpretation of exponential models'],
                 'Logarithms' : ['Introduction to logarithms', 'The constant e and the natural logarithm', 'Properties of logarithms', 'The change of base formula for logarithms', 'Solving exponential equations with logarithms', 'Solving exponential models'],
                 'Transformations of Functions' : ['Shifting functions', 'Reflecting functions', 'Symmetry of functions', 'Scaling functions', 'Putting it all together', 'Graphs of square and cube root functions', 'Graphs of exponential functions', 'Graphs of logarithmic functions'],
                 'Equations' : ['Rational equations', 'Square-root equations', 'Extraneous solutions', 'Cube-root equations', 'Quadratic systems', 'Solving equations by graphing'],
                 'Trigonometry' : ['Unit circle introduction', 'Radians', 'The Pythagorean identity', 'Trigonometric values of special angles', 'Graphs of sin(x), cos(x), and tan(x)', 'Amplitude, midline, and period', 'Transforming sinusoidal graphs', 'Graphing sinusoidal functions', 'Sinusoidal models'],
                 'Modeling' : ['Modeling with function combination', 'Interpreting features of functions', 'Maniuplating formulas', 'Modeling with two variables', 'Modeling with multiple variables'],
                 'Rational Functions' : ['Cancelling common factors', 'End behavior of rational functions', 'Discontinuities of rational functions', 'Graphs of rational functions', 'Modeling with rational functions', 'Multiplying and dividing rational expressions', 'Adding and subtracting rational expressions intro', 'Adding and subtracting rational expressions (factored)', 'Adding and subtracting rational expressions (not factored)']};

const grade12 = {'Right Triangles & Trigonometry' : ['Ratios in right triangles', 'Introduction to the trigonometric ratios', 'Solving for a side in a right triangle using the trigonometric ratios', 'Solving for an angle in a right triangle using the trigonometric ratios', 'Sine and cosine of complementary angles', 'Modeling with right triangles', 'The reciprocal trigonometric ratios'],
                 'Trigonometric Functions' : ['Unit circle introduction', 'Radians', 'The Pythagorean identity', 'Trigonometric values of special angles', 'Graphs of sin(x), cos(x), and tan(x)', 'Amplitude, midline, and period', 'Transforming sinusoidal graphs', 'Graphing sinusoidal functions', 'Sinusoidal models', 'Long live Tau'],
                 'Non-right Triangles and Trigonometry' : ['Law of sines', 'Law of cosines', 'Solving general triangles'],
                 'Trigonometric Equations and Identities' : ['Inverse trigonometric functions', 'Sinusoidal equations', 'Sinusoidal models', 'Trigonometric identities', 'Angle addition identities', 'Using trigonometric identities', 'Challenging trigonometric problems']}

const lesson_info = [gradeK, grade1, grade2, grade3, grade4, grade5, grade6, grade7, grade8, grade9, grade10, grade11, grade12]
let lesson_list = document.getElementById('lessonList');

let grade_element = document.getElementById('student-grade')
grade_element.addEventListener('change', (e) => {
  student_grade = e.target.value;
  current_lesson_data['grade'] = student_grade;
  populateLessons()
})

lesson_list.addEventListener('click', (e) => {
  if (e.target.className.includes('button2')) {
    let section = e.target.getAttribute('data-section');
    let lesson = e.target.getAttribute('data-lesson');
    if (current_lesson_data[student_grade][section][lesson]['status'] == 'not assigned') {
      setObjectValue([student_grade, section, lesson, 'date'], session_date.getTime(), current_lesson_data);
      setObjectValue([student_grade, section, lesson, 'status'], 'needs help', current_lesson_data);
      lesson_flag_counter += 1;
      populateLessons()
    }
    else if (current_lesson_data[student_grade][section][lesson]['status'] == 'needs help') {
      setObjectValue([student_grade, section, lesson, 'date'], session_date.getTime(), current_lesson_data);
      setObjectValue([student_grade, section, lesson, 'status'], 'assigned', current_lesson_data);
      lesson_flag_counter += 1;
      populateLessons()
    }
    else if (current_lesson_data[student_grade][section][lesson]['status'] == 'assigned') {
      setObjectValue([student_grade, section, lesson, 'date'], session_date.getTime(), current_lesson_data);
      setObjectValue([student_grade, section, lesson, 'status'], 'mastered', current_lesson_data);
      lesson_flag_counter += 1;
      populateLessons()
    }
    else if (current_lesson_data[student_grade][section][lesson]['status'] == 'mastered') {
      setObjectValue([student_grade, section, lesson, 'date'], 0, current_lesson_data);
      setObjectValue([student_grade, section, lesson, 'status'], 'not assigned', current_lesson_data);
      lesson_flag_counter -= 3;
      populateLessons()
    }
  }
})

function retrieveInitialData() {
  let student = queryStrings()['student'];

  let profileProm = getStudentProfile(student);
  let notesProm = getStudentNotes(student);
  let stProfileProm = getStudentMathProgramProfile(student); 

  let promises = [profileProm, notesProm, stProfileProm];
  return Promise.all(promises);
}

function getStudentProfile(studentUID) {
  const studentProfileRef = firebase.firestore().collection('Students').doc(studentUID);
  return studentProfileRef.get()
  .then((doc) => {
    if (doc.exists) {
      student_profile_data = doc.data();
    }
  })
}

function getStudentNotes(studentUID) {
  const studentNotesRef = firebase.firestore().collection('Students').doc(studentUID).collection('Math-Program').doc('notes');
  return studentNotesRef.get()
  .then((doc) => {
    if (doc.exists) {
      student_notes_data = doc.data();
    }
  })
}

function getStudentMathProgramProfile(studentUID) {
  const studentMathProgramProfileRef = firebase.firestore().collection('Students').doc(studentUID).collection('Math-Program').doc('profile');
  return studentMathProgramProfileRef.get()
  .then((doc) => {
    if (doc.exists) {
      student_math_program_profile_data = doc.data();
    }
  })
}

function queryStrings() {
  var GET = {};
  var queryString = window.location.search.replace(/^\?/, '');
  queryString.split(/\&/).forEach(function(keyValuePair) {
      var paramName = keyValuePair.replace(/=.*$/, ""); // some decoding is probably necessary
      var paramValue = keyValuePair.replace(/^[^=]*\=/, ""); // some decoding is probably necessary
      GET[paramName] = paramValue;
  });

  return GET;
}

function setStudentProfile() {
  document.getElementById('student-name').innerHTML = student_profile_data['studentFirstName'] + " " + student_profile_data['studentLastName'];
}

function setStudentSTProfile() {
  document.getElementById('student-expectation').innerHTML = student_math_program_profile_data['expectation'] || "No expectation set."
}

function allowExpectationChange() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      user.getIdTokenResult()
      .then((idTokenResult) => {
        let role = idTokenResult.claims.role;
        if (role == 'admin' || role == 'dev' || role == 'secretary') {
          document.getElementById("student-expectation").disabled = false;
          document.getElementById("student-expectation").addEventListener('keydown', updateStudentExpectation)
        }
      })
      .catch((error) => console.log(error));
      // .catch((error) => handleFirebaseErrors(error, window.location.href));
    }
  });
}

function updateStudentExpectation(event) {
  if (event.repeat) {return};
  if (!event.ctrlKey && event.key == "Enter") {
    event.preventDefault();
    let studentExpectationElem = document.getElementById('student-expectation');
    let expectationStr = studentExpectationElem.value;

    studentExpectationElem.style.borderColor = null;

    const studentMathProgramProfileRef = firebase.firestore().collection('Students').doc(queryStrings()['student']).collection('Math-Program').doc('profile');
    studentMathProgramProfileRef.get()
    .then((doc) => {
      if(doc.exists) {
        studentMathProgramProfileRef.update({
          expectation : expectationStr
        })
        .then(() => {
          studentExpectationElem.style.borderColor = "green";
        })
        .catch((error) => handleFirebaseErrors(error, window.location.href));
      }
      else {
        studentMathProgramProfileRef.set({
          expectation : expectationStr
        })
        .then(() => {
          studentExpectationElem.style.borderColor = "green";
        })
        .catch((error) => handleFirebaseErrors(error, window.location.href));
      }
    })
    .catch((error) => handleFirebaseErrors(error, window.location.href));
  }
}

//all of the notes stuff
function getNotes(type) {
  const notes = student_notes_data[type];
  let noteTimes = [];
  for (const time in notes) {
    noteTimes.push(parseInt(time));
  }

  noteTimes.sort((a,b) => {return a-b});
  for (let i = 0; i < noteTimes.length; i++) {
    setNotes(type, notes[noteTimes[i]]["note"], noteTimes[i], notes[noteTimes[i]]["user"], notes[noteTimes[i]]["isSessionNote"]);
  }
}

function setNotes(type, note, time, author, isSessionNote) {
  firebase.auth().onAuthStateChanged((user) => {
    const currentUser = user?.uid ?? null;
    if (user) {
      user.getIdTokenResult()
      .then((idTokenResult) => {
        let role = idTokenResult.claims.role;
        if (note) {
          //all the messages
          let messageBlock = document.getElementById('student-' + type + '-notes');
          //the div that contains the time and message
          let messageDiv = document.createElement('div');
          //the message itself
          let message = document.createElement('div');
          //time for the message
          let timeElem = document.createElement('p');

          //display the time above the mesasge
          timeElem.innerHTML = convertFromDateInt(time)['shortDate'];
          timeElem.classList.add('time');
          messageDiv.appendChild(timeElem);

          //set up the message
          message.innerHTML = note;
          //author's name element
          let authorElem = document.createElement('p');
          authorElem.classList.add("author");
          message.appendChild(authorElem);

          const getUserDisplayName = firebase.functions().httpsCallable('getUserDisplayName');
          getUserDisplayName({
            uid : author
          })
          .then((result) => {
            const authorName = result.data ?? "anonymous";
            authorElem.innerHTML = authorName;
            scrollBottomNotes(type);
          })
          .catch((error) => handleFirebaseErrors(error, window.location.href));

          messageDiv.setAttribute('data-time', time);
          message.classList.add("student-note");
          if (currentUser == author) {
            messageDiv.classList.add("right");
          }
          else {
            messageDiv.classList.add("left");
          }

          const getUserRole = firebase.functions().httpsCallable('getUserRole');
          getUserRole({
            uid : author
          })
          .then((result) => {
            const authorRole = result.data ?? null;
            if (authorRole == "admin") {
              message.classList.add("important");
            }
            scrollBottomNotes(type);
          })
          .catch((error) => handleFirebaseErrors(error, window.location.href));

          if (isSessionNote) {
            message.classList.add('session');
          }
          

          //only give the option to delete if the currentUser is the author, admin, or dev. Don't allow to delete if session notes
          if ((author == currentUser || role == "admin" || role == "dev") && !isSessionNote) {
            let deleteMessage = document.createElement('div');
            deleteMessage.classList.add("delete");
            let theX = document.createElement('p');
            theX.innerHTML = "X";
            theX.classList.add('no-margins');
            deleteMessage.appendChild(theX);
            deleteMessage.addEventListener('click', (event) => deleteNote(type, event));
            message.appendChild(deleteMessage);
          }
          
          messageDiv.appendChild(message);
          messageBlock.appendChild(messageDiv);
          document.getElementById('student-' + type + '-notes-input').value = null;
          scrollBottomNotes(type);
        }
      })
      .catch((error) =>  {
        handleFirebaseErrors(error, window.location.href);
        console.log(error);
      });
    }
  });
}

function deleteNote(type, event) {
  let message = event.target.closest(".student-note").parentNode;
  let confirmation = confirm("Are you sure you want to delete this message?");
  if (confirmation) {
    const currentStudent = queryStrings()['student'];
    const time = message.dataset.time;
    const studentNotesDocRef = firebase.firestore().collection("Students").doc(currentStudent).collection("Math-Program").doc("notes");
    studentNotesDocRef.update({
      [`${type}.${time}`] : firebase.firestore.FieldValue.delete()
    })
    .then(() => {
      message.remove();
    })
    .catch((error) => {
      handleFirebaseErrors(error, window.location.href);
    })
  }
}

function scrollBottomNotes(type) {
  let notes = document.getElementById("student-" + type + "-notes");
  notes.scrollTop = notes.scrollHeight;
}

function sendNotes(type, note, time, author, isSessionNote = false) {
  const data = {
    user : author,
    note : note,
    isSessionNote : isSessionNote
  } 

  const currentStudent = queryStrings()['student'];

  if (note) {
    //upload the note to firebase
    const studentNotesDocRef = firebase.firestore().collection("Students").doc(currentStudent).collection("Math-Program").doc("notes");
    studentNotesDocRef.get()
    .then((doc) => {
      if (doc.exists) {
        return studentNotesDocRef.update({
          [`${type}.${time}`] : data
        })
        .then(() => {
          //send the note into the message div
          note_flag = true;
          setNotes(type, note, time, author, isSessionNote);
        })
        .catch((error) => {
          handleFirebaseErrors(error, window.location.href);
        });
      }
      else {
        return studentNotesDocRef.set({
          [`${type}`] : {
            [`${time}`] : data
          }
        })
        .then(() => {
          //send the note into the message div
          note_flag = true;
          setNotes(type, note, time, author, isSessionNote);
        })
        .catch((error) => {
          handleFirebaseErrors(error, window.location.href);
        });
      }
    })
    .catch((error) => {
      handleFirebaseErrors(error, window.location.href);
      console.log(error);
    });
  }
  else {
    return Promise.resolve("No note.")
  }
}

document.getElementById("student-log-notes-input").addEventListener('keydown', (event) =>  {
  if (!event.ctrlKey && event.key == "Enter") {
    event.preventDefault();
    const currentUser = firebase.auth().currentUser.uid;
    const note = document.getElementById('student-log-notes-input').value;
    const time = session_date.getTime();
    sendNotes('log', note, time, currentUser);
  }
});

function removeLessons() {
  let children = lesson_list.querySelectorAll('div');
  const numChildren = children.length;
  for (let child = 0; child < numChildren; child++) {
    children[child].remove()
  }
}

function populateLessons() {
  removeLessons();
  document.getElementById('programLink').setAttribute('href', program_links[student_grade])
  let gradeLessons = lesson_info[student_grade]

  // Add the lessons
  let sections = Object.keys(gradeLessons)
  for (let i = 0; i < sections.length; i++) {
    // Add the section
    const element1 = createElement('div', ['sectionGridBox'], [], [], sections[i])
    const element2 = createElement('div', ['sectionGridBox'], [], [], "")
    element1.style.fontWeight = 'bold'
    lesson_list.append(element1);
    lesson_list.append(element2);
    
    // Add the lessons
    for (let j = 0; j < Object.values(gradeLessons[sections[i]]).length; j++) {
      const lesson = gradeLessons[sections[i]][j]
      const element1 = createElement('div', ['gridBox'], [], [] , lesson);
      const element2 = createElement('div', ['gridBox', 'button2'], ['data-section', 'data-lesson'], [sections[i], lesson], "")
      element2.classList.add(css_colors[current_lesson_data[student_grade][sections[i]][lesson]['status']])
      if (current_lesson_data[student_grade][sections[i]][lesson]['date'] != 0) {
        element2.innerHTML = convertFromDateInt(current_lesson_data[student_grade][sections[i]][lesson]['date'])['shortDate'];
      }
      lesson_list.append(element1);
      lesson_list.append(element2);
    }
  }
}

function initializeEmptyLessonsMap() {
  current_lesson_data = {'grade' : student_grade, 0 : {}, 1 : {}, 2 : {}, 3 : {}, 4 : {}, 5 : {}, 6 : {}, 7 : {}, 8 : {}, 9 : {}, 10 : {}, 11 : {}, 12 : {}};
  for (let g = 0; g < 13; g++) {
    const gradeLessons = lesson_info[g]
    const sections = Object.keys(gradeLessons);
    let lessons = undefined;
    let tmp = {};
    for (let i = 0; i < sections.length; i++) {
      lessons = Object.values(gradeLessons[sections[i]]);
      for (let j = 0; j < lessons.length; j++) {
        setObjectValue([sections[i], lessons[j], 'date'], 0, tmp);
        setObjectValue([sections[i], lessons[j], 'status'], 'not assigned', tmp);
      }
    }
    setObjectValue([g], tmp, current_lesson_data)
  }
}

/**
 * create html element
 * @param {String} elementType tag name for the element that will be created
 * @param {[String]} classes classes for the element
 * @param {[String]} attributes attributes for the element
 * @param {[String]} values values for each attribute for the element
 * @param {String} text innerhtml for the element
 * @returns {HTMLElement} html element of the given tag
 */
function createElement(elementType, classes = [], attributes = [], values = [], text = "") {
  // Initialize the element
  let element = document.createElement(elementType);

  // Set each of the specified attributes for the element
  if (attributes.length == values.length && attributes.length > 0) {
    for (let i = 0; i < attributes.length; i++) {
      element.setAttribute(attributes[i], values[i]);
    }
  }

  // Add the classes to the element
  for (let i = 0; i < classes.length; i++) {
    element.classList.add(classes[i]);
  }

  // Set the inner html text
  if (text != "") {
    element.innerHTML = text;
  }

  // Return the element
  return element;
}

function getLessons() {
  return new Promise((resolve, reject) => {
    let student = queryStrings()['student'];
    lessonsRef = firebase.firestore().collection('Students').doc(student).collection('Math-Program').doc('lessons')

    lessonsRef.get()
    .then((doc) => {
      if (doc.exists) {
        current_lesson_data = doc.data();
        student_grade = doc.data()['grade'];
      }
      else {
        if (current_lesson_data == undefined) {
          initializeEmptyLessonsMap();
        }
      }
      populateLessons();
      document.getElementById('student-grade').value = student_grade;
    })
    .then(() => resolve())
    .catch((error) => reject('Fb error:' + error))
  })
}

function submitLessons() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        user.getIdTokenResult()
        .then((idTokenResult) => {
          let role = idTokenResult.claims.role;
          if (note_flag == true || role == 'admin' || role == 'dev') {
            if (lesson_flag_counter > 0 || role == 'admin' || role == 'dev') {
              let confirmation = undefined
              if (role == 'admin' || role == 'dev') {
                confirmation = window.confirm("Are you sure you are ready submit your changes");
              }
              else {
                confirmation = window.confirm("Are you sure you are ready to submit this session?");
              }
              if (confirmation == true) {
                let student = queryStrings()['student'];
                lessonsRef = firebase.firestore().collection('Students').doc(student).collection('Math-Program').doc('lessons')

                lessonsRef.set(current_lesson_data).then(() => goToDashboard())
                .catch((error) => reject('Fb error:' + error))
              }
            }
            else {
              document.getElementById('errorMessage').innerHTML = 'Please mark a lesson'
            }
          }
          else {
            document.getElementById('errorMessage').innerHTML = 'Please enter a comment for what occurred during the session'
          }
      })
      .catch((error) => {
      handleFirebaseErrors(error, window.location.href);
      });
    }
    else {
      console.log("bad user")
    }
  })
}

document.getElementById("student-general-info").addEventListener("dblclick", () => {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      user.getIdTokenResult()
      .then((idTokenResult) => {
        let role = idTokenResult.claims.role;
        if (role == 'dev' || role == 'admin' || role == 'secretary' ) {
          const studentUID = queryStrings()['student']
          let queryStr = "?student=" + studentUID;
          window.location.href = "inquiry.html" + queryStr;
        }
      })
    }
  });
});

function openHelp() {
  document.getElementById("helpModal").style.display = "flex";
}

function closeHelp(e) {
  if (e.target !== e.currentTarget) return;
  document.getElementById("helpModal").style.display = "none";
}
