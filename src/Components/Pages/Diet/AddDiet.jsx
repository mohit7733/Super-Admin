import { useState } from "react";
import {
  Apple,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Coffee,
  Info,
  Moon,
  Plus,
  Sun,
  Trash2,
   UploadCloud,
  Utensils,
  X,
} from "lucide-react";

import "./AddDiet.css";

/* =========================================================
   MEAL PRESETS
========================================================= */

const mealPresets = [
  {
    name: "Morning",
    tone: "morning",
    icon: Sun,
    foods:
      "• Warm lemon water\n• 5 soaked almonds",
    steps:
      "• Boil 1 glass water, cool slightly, add fresh lemon juice.",
    calories: "85",
    carbs: "6",
    protein: "3",
    fat: "5",
  },

  {
    name: "Breakfast",
    tone: "breakfast",
    icon: Coffee,
    foods:
      "• Oats porridge with banana\n• Herbal ginger tea",
    steps:
      "• Cook oats in water or milk, top with sliced banana.",
    calories: "340",
    carbs: "55",
    protein: "10",
    fat: "9",
  },

  {
    name: "Midday",
    tone: "midday",
    icon: Apple,
    foods:
      "• 1 apple\n• Cucumber slices",
    steps:
      "• Wash and slice fresh apple and cucumber.",
    calories: "120",
    carbs: "28",
    protein: "2",
    fat: "0",
  },

  {
    name: "Lunch",
    tone: "lunch",
    icon: Utensils,
    foods:
      "• 2 whole wheat chapatis\n• Mixed vegetable curry\n• Cucumber-mint salad",
    steps:
      "• Prepare mild curry with cumin and coriander.",
    calories: "480",
    carbs: "68",
    protein: "14",
    fat: "12",
  },

  {
    name: "Dinner",
    tone: "dinner",
    icon: Moon,
    foods:
      "• Moong dal khichdi\n• Fresh curd",
    steps:
      "• Cook rice, dal and lauki with mild spices.",
    calories: "410",
    carbs: "58",
    protein: "17",
    fat: "11",
  },
];

/* =========================================================
   CREATE MEALS FOR A NEW DAY
========================================================= */

const createMealsForDay = (dayNumber) => {
  return mealPresets.map((meal, index) => ({
    ...meal,
    id: `day-${dayNumber}-meal-${index}`,
  }));
};

/* =========================================================
   CREATE EXTRA MEAL
========================================================= */

const createMeal = (dayNumber, index) => {
  const preset =
    mealPresets[index % mealPresets.length];

  return {
    ...preset,
    id: `day-${dayNumber}-extra-${Date.now()}-${index}`,
  };
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Page() {
  /* =======================================================
     DAYS
  ======================================================= */

  const [days, setDays] = useState([1]);
    const [dietImage, setDietImage] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState(null);

  /* =======================================================
     STATUS
  ======================================================= */

  const [isActive, setIsActive] =
    useState(true);



  const [dayMeals, setDayMeals] = useState({
    1: createMealsForDay(1),
  });
 const handleImageChange = (event) => {

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    /*
      Maximum 2 MB.
    */

    if (
      file.size >
      2 * 1024 * 1024
    ) {
      alert(
        "Image size must be less than 2MB."
      );

      return;
    }

    setDietImage(file);

    const reader =
      new FileReader();

    reader.onloadend = () => {
      setImagePreview(
        reader.result
      );
    };

    reader.readAsDataURL(file);
  };
    const removeImage = () => {

    setDietImage(null);

    setImagePreview(null);
  };

  /* =======================================================
     ADD DAY
  ======================================================= */

  const addDay = () => {
    // Maximum 7 days
    if (days.length >= 7) {
      return;
    }

    /*
      Find the highest existing day number.

      Example:

      [1]       -> 2
      [1,2]     -> 3
      [1,3]     -> 4
      [1,3,4]   -> 5
    */

    const newDay =
      days.length === 0
        ? 1
        : Math.max(...days) + 1;

    /* Add new day */

    setDays((previousDays) => [
      ...previousDays,
      newDay,
    ]);

    /* Automatically create
       Morning
       Breakfast
       Midday
       Lunch
       Dinner
    */

    setDayMeals((previousMeals) => ({
      ...previousMeals,

      [newDay]:
        createMealsForDay(newDay),
    }));
  };

  /* =======================================================
     DELETE COMPLETE DAY
  ======================================================= */

  const deleteDay = (dayNumber) => {
    /*
      Don't allow Day 1 to be deleted.
    */

    if (dayNumber === 1) {
      return;
    }

    /* Remove day from days array */

    setDays((previousDays) =>
      previousDays.filter(
        (day) => day !== dayNumber
      )
    );

    /* Remove complete day meals */

    setDayMeals((previousMeals) => {
      const updatedMeals = {
        ...previousMeals,
      };

      delete updatedMeals[dayNumber];

      return updatedMeals;
    });
  };

  /* =======================================================
     ADD MEAL TO SPECIFIC DAY
  ======================================================= */

  const addMeal = (dayNumber) => {
    setDayMeals((previousMeals) => {
      const currentMeals =
        previousMeals[dayNumber] || [];

      const newMeal = createMeal(
        dayNumber,
        currentMeals.length
      );

      return {
        ...previousMeals,

        [dayNumber]: [
          ...currentMeals,
          newMeal,
        ],
      };
    });
  };

  /* =======================================================
     DELETE MEAL FROM SPECIFIC DAY
  ======================================================= */

  const removeMeal = (
    dayNumber,
    mealId
  ) => {
    setDayMeals((previousMeals) => ({
      ...previousMeals,

      [dayNumber]: (
        previousMeals[dayNumber] || []
      ).filter(
        (meal) => meal.id !== mealId
      ),
    }));
  };

 

  return (
    <div className="page-header">

  

      <header className="page-heading">
        <div>

          <h1>
            Add Diet Plan
          </h1>

          <p>
            Create a new diet plan with meal
            schedule and nutrition details.
          </p>

        </div>
      </header>

    

      <section className="panels">

        <SectionTitle
          icon={
            <ClipboardList size={18} />
          }
          title="Basic Details"
        />

        <div className="form-grid three">

          {/* Diet Plan Name */}

          <label>
            Diet Plan Name <em>*</em>

            <input
              placeholder="Enter diet plan name"
            />
          </label>

         

          <label>
            Prakriti <em>*</em>

            <select defaultValue="">
              <option
                value=""
                disabled
              >
                Select prakriti
              </option>

              <option value="Vata">
                Vata
              </option>

              <option value="Pitta">
                Pitta
              </option>

              <option value="Kapha">
                Kapha
              </option>
            </select>
          </label>



          <label>
            Season <em>*</em>

            <select defaultValue="">
              <option
                value=""
                disabled
              >
                Select season
              </option>

              <option value="Summer">
                Summer
              </option>

              <option value="Winter">
                Winter
              </option>
            </select>
          </label>

       

          <label>
            Health Diseases <em>*</em>

            <div className="tag-input">

              <span>
                Migraine
                <X size={12} />
              </span>

              <span>
                PCOD
                <X size={12} />
              </span>

              <span>
                Hypothyroidism
                <X size={12} />
              </span>

              <ChevronDown size={15} />

            </div>
          </label>


          <fieldset>

            <legend>
              Is Paid?
            </legend>

            <div className="radio-row">

              <label>
                <input
                  type="radio"
                  name="paid"
                  value="yes"
                />
                Yes
              </label>

              <label>
                <input
                  type="radio"
                  name="paid"
                  value="no"
                  defaultChecked
                />
                No
              </label>

            </div>

          </fieldset>

      

          <fieldset>

            <legend>
              Is Common?
            </legend>

            <div className="radio-row">

              <label>
                <input
                  type="radio"
                  name="common"
                  value="yes"
                  defaultChecked
                />
                Yes
              </label>

              <label>
                <input
                  type="radio"
                  name="common"
                  value="no"
                />
                No
              </label>

            </div>

          </fieldset>

          {/* Price */}

          <label>
            Price (₹)

            <input
              placeholder="0.00"
            />
          </label>

        </div>
      </section>

      {/* ===================================================
          DIET SCHEDULE
      =================================================== */}

      <section className="panels schedule-panels">

        <SectionTitle
          icon={
            <CalendarDays size={18} />
          }
          title="Diet Schedule"
          subtitle="Add meals for each day. You can add up to 7 days."
        />

     
<div className="day-controls">

  <div></div>

  <button
    className="add-day"
    type="button"
    onClick={addDay}
    disabled={days.length >= 7}
  >
    <Plus size={15} />
    Add Day
  </button>

</div>
       
        {days.map((day) => (

          <div
            className="diet-day-section"
            key={day}
          >

        
            <div className="diet-day-header">

              <h3>
                Day {day}
              </h3>

              {/* DELETE DAY */}

              {day !== 1 && (

                <button
                  type="button"
                  className="delete-day"
                  onClick={() =>
                    deleteDay(day)
                  }
                  title={`Delete Day ${day}`}
                >

                  <Trash2 size={15} />

                  Delete Day

                </button>

              )}

            </div>

           

            <div className="meal-list">

              {(dayMeals[day] || []).map(
                (meal) => (

                  <MealCard
                    key={`${day}-${meal.id}`}
                    meal={meal}
                    onRemove={() =>
                      removeMeal(
                        day,
                        meal.id
                      )
                    }
                  />

                )
              )}

            </div>

            {/* =============================================
                ADD MEAL
            ============================================= */}

            {/* <div className="day-add-meal">

              <button
                className="add-meal"
                type="button"
                onClick={() =>
                  addMeal(day)
                }
              >

                <Plus size={16} />

                Add Meal

              </button>

            </div> */}

          </div>

        ))}

      </section>

      {/* ===================================================
          ADDITIONAL INFORMATION
      =================================================== */}

    <section className="panels">
  <SectionTitle
    icon={<Info size={18} />}
    title="Additional Information"
  />

  <div className="form-grid two">
    {/* Description */}
    <label>
      Description
      <textarea
        placeholder="Enter diet plan description (optional)"
      />
    </label>

    {/* Notes */}
    <label>
      Notes / Tips
      <textarea
        placeholder="Enter any notes or tips for this diet plan (optional)"
      />
    </label>
  </div>

  <div className="diet-bottom-row">
    {/* =================================================
        DIET PLAN IMAGE
    ================================================= */}
    <div className="diet-image-section">
      <label className="bottom-field-label">
        Diet Plan Image <span>(Optional)</span>
      </label>

      <label className="image-upload-box">
        <input
          type="file"
          accept=".svg,.png,.jpg,.jpeg,.gif"
          onChange={handleImageChange}
        />

        <div className="upload-icon">
          <UploadCloud size={20} />
        </div>

        <div className="upload-content">
          <strong>
            {dietImage
              ? dietImage.name
              : "Click to upload or drag and drop"}
          </strong>

          <small>
            SVG, PNG, JPG or GIF (Max. 2MB)
          </small>
        </div>
      </label>

      {/* IMAGE PREVIEW */}
      {imagePreview && (
        <div className="image-preview">
          <img
            src={imagePreview}
            alt="Diet Plan Preview"
          />

          <button
            type="button"
            className="remove-image"
            onClick={removeImage}
          >
            <X size={13} />
          </button>
        </div>
      )}
    </div>

    {/* =================================================
        STATUS
    ================================================= */}
    <div className="status-section">
      <label className="bottom-field-label">
        Status
      </label>

      <div className="status-options">
        {/* ACTIVE */}
        <button
          type="button"
          className={`status-option ${
            isActive ? "active" : ""
          }`}
          onClick={() => setIsActive(true)}
        >
          <span
            className={`status-toggle ${
              isActive ? "toggle-on" : "toggle-off"
            }`}
          >
            <span />
          </span>

          <span>Active</span>
        </button>

        {/* INACTIVE */}
        <button
          type="button"
          className={`status-option ${
            !isActive ? "active" : ""
          }`}
          onClick={() => setIsActive(false)}
        >
          <span
            className={`status-toggle ${
              !isActive ? "toggle-on" : "toggle-off"
            }`}
          >
            <span />
          </span>

          <span>Inactive</span>
        </button>
      </div>
    </div>
  </div>
</section>

    </div>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  icon,
  title,
  subtitle,
}) {
  return (
    <div className="section-title">

      {icon}

      <div>

        <strong>
          {title}
        </strong>

        {subtitle && (
          <small>
            {subtitle}
          </small>
        )}

      </div>

    </div>
  );
}

/* =========================================================
   MEAL CARD
========================================================= */

function MealCard({
  meal,
  onRemove,
}) {
  const Icon = meal.icon;

  return (
    <article
      className={`meal-card ${meal.tone}`}
    >

      {/* ===============================================
          MEAL TYPE
      =============================================== */}

      <div className="meal-type">

        <Icon size={22} />

        <strong>
          {meal.name}
        </strong>

      </div>

      {/* ===============================================
          FOOD ITEMS
      =============================================== */}

      <label>

        Diet / Food Items <em>*</em>

        <textarea
          defaultValue={meal.foods}
        />

      </label>

      {/* ===============================================
          PREPARATION STEPS
      =============================================== */}

      <label>

        Preparation Steps

        <textarea
          defaultValue={meal.steps}
        />

      </label>

      {/* ===============================================
          NUTRITION
      =============================================== */}

      <div className="nutrition">

        <span>
          Nutrition Information
        </span>

        <div>

          {/* Calories */}

          <label>

            Calories (kcal)

            <input
              defaultValue={
                meal.calories
              }
            />

          </label>

          {/* Carbs */}

          <label>

            Carbs (g)

            <input
              defaultValue={
                meal.carbs
              }
            />

          </label>

          {/* Protein */}

          <label>

            Protein (g)

            <input
              defaultValue={
                meal.protein
              }
            />

          </label>

          {/* Fat */}

          <label>

            Fat (g)

            <input
              defaultValue={
                meal.fat
              }
            />

          </label>

        </div>

      </div>

      {/* ===============================================
          DELETE MEAL
      =============================================== */}

      <button
        className="delete-meal"
        type="button"
        aria-label={`Delete ${meal.name}`}
        onClick={onRemove}
      >

        <Trash2 size={15} />

      </button>

    </article>
  );
}