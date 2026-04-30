package com.gyansetu.config;

import com.gyansetu.model.*;
import com.gyansetu.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class McqDataInitializer implements CommandLineRunner {

    private final CourseRepository courseRepository;
    private final AssignmentRepository assignmentRepository;
    private final QuestionRepository questionRepository;

    public McqDataInitializer(
            CourseRepository courseRepository,
            AssignmentRepository assignmentRepository,
            QuestionRepository questionRepository) {
        this.courseRepository = courseRepository;
        this.assignmentRepository = assignmentRepository;
        this.questionRepository = questionRepository;
    }

    @Override
    public void run(String... args) {
        System.out.println("MCQ INITIALIZER RUNNING...");
        insertHappyAbcs();
        insertNumbersFun();
        insertShapesColors();
        insertStorytime();
        insertAddSubtract();
        insertDrawing();
        insertSensesWeather();
        insertTimesTables();
        insertGoodHabits();
        insertReading();
        insertMathPuzzles();
        insertPlantsAnimals();


    }

    private void insertPlantsAnimals() {

        Course course = courseRepository.findById(12L).orElse(null);
        if (course == null) return;
        if (assignmentRepository.findByCourseId(course.getId()).size() > 0) return;

        Assignment assignment = new Assignment();
        assignment.setTitle("Plants & Animals MCQ Test");
        assignment.setInstructions("Answer questions about plants and animals.");
        assignment.setCourse(course);
        assignmentRepository.save(assignment);

        createQuestion("Which animal barks?", "Dog", "Cat", "Cow", "Bird", "A", assignment);
        createQuestion("Plants need what to grow?", "Water", "Shoes", "Cars", "Books", "A", assignment);

        for (int i = 0; i < 23; i++) {
            createQuestion("Which animal gives milk?", "Cow", "Dog", "Cat", "Hen", "A", assignment);
        }
    }


    private void insertMathPuzzles() {

        Course course = courseRepository.findById(11L).orElse(null);
        if (course == null) return;
        if (assignmentRepository.findByCourseId(course.getId()).size() > 0) return;

        Assignment assignment = new Assignment();
        assignment.setTitle("Math Puzzles MCQ Test");
        assignment.setInstructions("Solve all puzzle questions.");
        assignment.setCourse(course);
        assignmentRepository.save(assignment);

        createQuestion("What comes next: 2, 4, 6, ?", "8", "7", "9", "5", "A", assignment);

        for (int i = 0; i < 24; i++) {
            createQuestion("Pattern: 1, 3, 5, ?", "7", "6", "8", "9", "A", assignment);
        }
    }


    private void insertReading() {

        Course course = courseRepository.findById(10L).orElse(null);
        if (course == null) return;
        if (assignmentRepository.findByCourseId(course.getId()).size() > 0) return;

        Assignment assignment = new Assignment();
        assignment.setTitle("Reading Comprehension MCQ Test");
        assignment.setInstructions("Read carefully and answer questions.");
        assignment.setCourse(course);
        assignmentRepository.save(assignment);

        createQuestion("A paragraph is made of?", "Sentences", "Numbers", "Shapes", "Colors", "A", assignment);

        for (int i = 0; i < 24; i++) {
            createQuestion("We read books using?", "Eyes", "Ears", "Nose", "Hands", "A", assignment);
        }
    }


    private void insertGoodHabits() {

        Course course = courseRepository.findById(9L).orElse(null);
        if (course == null) return;
        if (assignmentRepository.findByCourseId(course.getId()).size() > 0) return;

        Assignment assignment = new Assignment();
        assignment.setTitle("Good Habits MCQ Test");
        assignment.setInstructions("Answer questions about good habits.");
        assignment.setCourse(course);
        assignmentRepository.save(assignment);

        createQuestion("What should you say when someone helps you?", "Thank you", "Go away", "Nothing", "No", "A", assignment);
        createQuestion("We should brush teeth how many times?", "2 times", "1 time", "Never", "5 times", "A", assignment);

        for (int i = 0; i < 23; i++) {
            createQuestion("Should we throw garbage on road?", "No", "Yes", "Maybe", "Always", "A", assignment);
        }
    }



    private void insertTimesTables() {

        Course course = courseRepository.findById(8L).orElse(null);
        if (course == null) return;
        if (assignmentRepository.findByCourseId(course.getId()).size() > 0) return;

        Assignment assignment = new Assignment();
        assignment.setTitle("Times Tables 2–5 MCQ Test");
        assignment.setInstructions("Solve all multiplication questions.");
        assignment.setCourse(course);
        assignmentRepository.save(assignment);

        createQuestion("2 x 2 = ?", "4", "6", "8", "2", "A", assignment);
        createQuestion("3 x 3 = ?", "6", "9", "12", "3", "B", assignment);
        createQuestion("4 x 2 = ?", "6", "8", "10", "12", "B", assignment);

        for (int i = 0; i < 22; i++) {
            createQuestion("5 x 2 = ?", "10", "12", "8", "6", "A", assignment);
        }
    }


    private void insertSensesWeather() {

        Course course = courseRepository.findById(7L).orElse(null);
        if (course == null) return;
        if (assignmentRepository.findByCourseId(course.getId()).size() > 0) return;

        Assignment assignment = new Assignment();
        assignment.setTitle("Senses & Weather MCQ Test");
        assignment.setInstructions("Answer all questions about senses and weather.");
        assignment.setCourse(course);
        assignmentRepository.save(assignment);

        createQuestion("Which sense do we use to see?", "Eyes", "Nose", "Hands", "Ears", "A", assignment);
        createQuestion("Which sense do we use to hear?", "Ears", "Eyes", "Nose", "Feet", "A", assignment);
        createQuestion("Which sense smells flowers?", "Nose", "Eyes", "Ears", "Hands", "A", assignment);

        for (int i = 0; i < 22; i++) {
            createQuestion("Rain comes from?", "Clouds", "Ground", "Trees", "Road", "A", assignment);
        }
    }


    private void insertDrawing() {

        Course course = courseRepository.findById(6L).orElse(null);
        if (course == null) return;
        if (assignmentRepository.findByCourseId(course.getId()).size() > 0) return;

        Assignment assignment = new Assignment();
        assignment.setTitle("Drawing & Creativity MCQ Test");
        assignment.setInstructions("Answer questions about drawing and creativity.");
        assignment.setCourse(course);
        assignmentRepository.save(assignment);

        createQuestion("Which tool is used for coloring?", "Crayons", "Shoes", "Book", "Plate", "A", assignment);
        createQuestion("What do we use to draw lines?", "Pencil", "Spoon", "Cup", "Ball", "A", assignment);
        createQuestion("Which color is made by mixing red and yellow?", "Orange", "Blue", "Green", "Black", "A", assignment);

        for (int i = 0; i < 22; i++) {
            createQuestion("Drawing helps improve?", "Creativity", "Sleeping", "Noise", "Nothing", "A", assignment);
        }
    }

    private void insertAddSubtract() {

        Course course = courseRepository.findById(5L).orElse(null);
        if (course == null) return;
        if (assignmentRepository.findByCourseId(course.getId()).size() > 0) return;

        Assignment assignment = new Assignment();
        assignment.setTitle("Addition & Subtraction MCQ Test");
        assignment.setInstructions("Solve all addition and subtraction questions.");
        assignment.setCourse(course);
        assignmentRepository.save(assignment);

        createQuestion("5 + 3 = ?", "8", "7", "6", "9", "A", assignment);
        createQuestion("10 - 4 = ?", "5", "6", "7", "8", "B", assignment);
        createQuestion("7 + 2 = ?", "8", "9", "6", "5", "B", assignment);
        createQuestion("9 - 3 = ?", "5", "6", "7", "4", "B", assignment);

        for (int i = 0; i < 21; i++) {
            createQuestion("2 + 2 = ?", "3", "4", "5", "6", "B", assignment);
        }
    }


    private void insertStorytime() {

        Course course = courseRepository.findById(4L).orElse(null);
        if (course == null) return;
        if (assignmentRepository.findByCourseId(course.getId()).size() > 0) return;

        Assignment assignment = new Assignment();
        assignment.setTitle("Storytime MCQ Test");
        assignment.setInstructions("Read carefully and answer all story questions.");
        assignment.setCourse(course);
        assignmentRepository.save(assignment);

        for (int i = 1; i <= 25; i++) {
            createQuestion(
                    "In a story, who is usually the main character?",
                    "Hero",
                    "Tree",
                    "Car",
                    "Rock",
                    "A",
                    assignment
            );
        }
    }


    private void insertHappyAbcs() {
        Course course = courseRepository.findAll()
                .stream()
                .filter(c -> c.getTitle().equals("Happy ABCs"))
                .findFirst()
                .orElse(null);

        if (course == null) return;

        if (assignmentRepository.findByCourseId(course.getId()).size() > 0) return;

        Assignment assignment = new Assignment();
        assignment.setTitle("Alphabet Adventure MCQ Test");
        assignment.setInstructions("Answer all 25 alphabet questions.");
        assignment.setCourse(course);
        assignmentRepository.save(assignment);

        createQuestion("Which letter comes after A?", "B", "C", "D", "E", "A", assignment);
        createQuestion("Which word starts with C?", "Dog", "Cat", "Ball", "Egg", "B", assignment);
        createQuestion("Which letter is a vowel?", "B", "C", "A", "D", "C", assignment);
        createQuestion("What comes after M?", "L", "N", "O", "P", "B", assignment);
        createQuestion("Which word starts with S?", "Sun", "Dog", "Cat", "Fish", "A", assignment);
        createQuestion("Which letter comes before F?", "D", "E", "G", "H", "B", assignment);
        createQuestion("What is the first letter of Lion?", "L", "I", "O", "N", "A", assignment);
        createQuestion("Which word begins with P?", "Pig", "Cat", "Sun", "Apple", "A", assignment);
        createQuestion("Which letter comes after T?", "U", "V", "W", "X", "A", assignment);
        createQuestion("Which letter makes 'mmm' sound?", "M", "N", "L", "R", "A", assignment);

        createQuestion("What is first letter of Dog?", "D", "O", "G", "B", "A", assignment);
        createQuestion("Which word starts with H?", "Hat", "Ice", "Ball", "Tree", "A", assignment);
        createQuestion("Which letter comes after R?", "S", "T", "U", "Q", "A", assignment);
        createQuestion("Which letter is vowel?", "E", "B", "D", "F", "A", assignment);
        createQuestion("Which word starts with B?", "Ball", "Dog", "Cat", "Fish", "A", assignment);
        createQuestion("Which letter comes after H?", "I", "J", "G", "K", "A", assignment);
        createQuestion("Which word starts with F?", "Fish", "Apple", "Ball", "Tree", "A", assignment);
        createQuestion("Which letter comes before Z?", "Y", "X", "W", "V", "A", assignment);
        createQuestion("Which word starts with T?", "Tree", "Dog", "Ball", "Cat", "A", assignment);
        createQuestion("Which letter is in Car?", "C", "Z", "X", "Q", "A", assignment);

        createQuestion("Which word starts with A?", "Ant", "Ball", "Cat", "Dog", "A", assignment);
        createQuestion("Which letter comes after C?", "D", "E", "F", "G", "A", assignment);
        createQuestion("Which letter makes 'buh' sound?", "B", "C", "D", "A", "A", assignment);
        createQuestion("Which letter comes after Y?", "Z", "X", "W", "V", "A", assignment);
        createQuestion("Which word starts with E?", "Elephant", "Dog", "Cat", "Fish", "A", assignment);
    }

    private void insertNumbersFun() {
        Course course = courseRepository.findById(2L).orElse(null);

        if (course == null) return;
        if (assignmentRepository.findByCourseId(course.getId()).size() > 0) return;

        Assignment assignment = new Assignment();
        assignment.setTitle("Numbers 1–20 MCQ Test");
        assignment.setInstructions("Answer all number questions.");
        assignment.setCourse(course);
        assignmentRepository.save(assignment);

        createQuestion("What comes after 5?", "6", "7", "4", "8", "A", assignment);
        createQuestion("What number comes before 10?", "8", "9", "11", "7", "B", assignment);
        createQuestion("How many apples in 2 + 3?", "4", "5", "6", "3", "B", assignment);
        createQuestion("Which is bigger?", "2", "5", "1", "3", "B", assignment);
        createQuestion("What is 10 - 1?", "8", "9", "7", "6", "B", assignment);
        createQuestion("Which number is smallest?", "4", "1", "7", "9", "B", assignment);
        createQuestion("What comes after 19?", "18", "20", "17", "21", "B", assignment);
        createQuestion("What is 3 + 3?", "5", "6", "7", "4", "B", assignment);
        createQuestion("How many fingers in one hand?", "5", "6", "4", "3", "A", assignment);
        createQuestion("What is 7 - 2?", "4", "5", "6", "3", "B", assignment);

        createQuestion("What comes before 1?", "0", "2", "3", "4", "A", assignment);
        createQuestion("Which number is even?", "3", "5", "4", "7", "C", assignment);
        createQuestion("What is 8 + 1?", "9", "10", "7", "6", "A", assignment);
        createQuestion("Which is greater?", "6", "2", "1", "3", "A", assignment);
        createQuestion("What is 2 + 2?", "3", "4", "5", "6", "B", assignment);
        createQuestion("What comes after 14?", "15", "13", "16", "12", "A", assignment);
        createQuestion("Which number is odd?", "4", "6", "9", "8", "C", assignment);
        createQuestion("What is 10 + 5?", "14", "15", "16", "13", "B", assignment);
        createQuestion("How many sides does a square have?", "3", "4", "5", "6", "B", assignment);
        createQuestion("What is 1 + 1?", "1", "2", "3", "4", "B", assignment);

        createQuestion("Which number is biggest?", "18", "20", "17", "19", "B", assignment);
        createQuestion("What is 9 - 3?", "5", "6", "4", "7", "B", assignment);
        createQuestion("What comes before 6?", "5", "4", "7", "3", "A", assignment);
        createQuestion("What is 4 + 5?", "8", "9", "7", "6", "B", assignment);
        createQuestion("How many legs does a cat have?", "2", "3", "4", "5", "C", assignment);
    }

    private void insertShapesColors() {
        Course course = courseRepository.findById(3L).orElse(null);


        if (course == null) return;
        if (assignmentRepository.findByCourseId(course.getId()).size() > 0) return;

        Assignment assignment = new Assignment();
        assignment.setTitle("Shapes & Colors MCQ Test");
        assignment.setInstructions("Answer all shape and color questions.");
        assignment.setCourse(course);
        assignmentRepository.save(assignment);

        createQuestion("How many sides does a triangle have?", "3", "4", "5", "6", "A", assignment);
        createQuestion("What shape has 4 equal sides?", "Circle", "Square", "Triangle", "Star", "B", assignment);
        createQuestion("What color is the sky?", "Blue", "Red", "Green", "Pink", "A", assignment);
        createQuestion("What shape is a ball?", "Square", "Triangle", "Circle", "Rectangle", "C", assignment);
        createQuestion("What color is grass?", "Blue", "Yellow", "Green", "Red", "C", assignment);

        createQuestion("How many sides does a square have?", "4", "3", "5", "6", "A", assignment);
        createQuestion("What shape has no sides?", "Circle", "Triangle", "Square", "Rectangle", "A", assignment);
        createQuestion("What color is the sun?", "Blue", "Yellow", "Green", "Pink", "B", assignment);
        createQuestion("Which shape has 4 sides but not equal?", "Rectangle", "Circle", "Triangle", "Star", "A", assignment);
        createQuestion("What color are strawberries?", "Blue", "Green", "Red", "Yellow", "C", assignment);

        createQuestion("Which shape has 3 sides?", "Square", "Triangle", "Circle", "Rectangle", "B", assignment);
        createQuestion("What color is banana?", "Yellow", "Blue", "Green", "Pink", "A", assignment);
        createQuestion("What shape is a door?", "Circle", "Triangle", "Rectangle", "Star", "C", assignment);
        createQuestion("What color is an apple?", "Red", "Blue", "Pink", "Black", "A", assignment);
        createQuestion("Which shape looks like a box?", "Square", "Circle", "Star", "Triangle", "A", assignment);

        createQuestion("What color is the sky at night?", "Blue", "Black", "Yellow", "Pink", "B", assignment);
        createQuestion("How many sides does a rectangle have?", "3", "4", "5", "6", "B", assignment);
        createQuestion("Which shape is round?", "Circle", "Square", "Triangle", "Star", "A", assignment);
        createQuestion("What color is an orange fruit?", "Red", "Green", "Orange", "Blue", "C", assignment);
        createQuestion("Which shape has 5 sides?", "Pentagon", "Triangle", "Square", "Circle", "A", assignment);

        createQuestion("What color is milk?", "White", "Black", "Blue", "Green", "A", assignment);
        createQuestion("Which shape has equal 4 sides?", "Square", "Rectangle", "Triangle", "Circle", "A", assignment);
        createQuestion("What color is leaf?", "Green", "Red", "Blue", "Pink", "A", assignment);
        createQuestion("Which shape looks like pizza slice?", "Triangle", "Square", "Circle", "Rectangle", "A", assignment);
        createQuestion("What color is chocolate?", "Brown", "Green", "Blue", "Yellow", "A", assignment);
    }

    private void createQuestion(String text, String a, String b, String c, String d, String correct, Assignment assignment) {
        Question q = new Question();
        q.setQuestionText(text);
        q.setOptionA(a);
        q.setOptionB(b);
        q.setOptionC(c);
        q.setOptionD(d);
        q.setCorrectAnswer(correct);
        q.setAssignment(assignment);
        questionRepository.save(q);
    }
}
