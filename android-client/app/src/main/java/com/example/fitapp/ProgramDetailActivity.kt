package com.example.fitapp

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class ProgramDetailActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_program_detail)

        val btnStartWorkout = findViewById<Button>(R.id.btnStartWorkout)
        val btnFavorite = findViewById<Button>(R.id.btnFavorite)

        btnStartWorkout.setOnClickListener {
            startActivity(Intent(this, WorkoutActivity::class.java))
        }

        btnFavorite.setOnClickListener {
            Toast.makeText(this, "Programme ajouté aux favoris localement", Toast.LENGTH_SHORT).show()
        }
    }
}